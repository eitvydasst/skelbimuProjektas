import Express from "express";
import cookieParser from "cookie-parser";
import fs from 'fs';

import {loggingMiddleware, serveFile} from "./middlewares.js";
import FirebaseTools from './firebase.js';

import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const allCategories = ['Telefonai', 'Kompiuteriai', 'Buitinė technika'];

const app = Express();
const port = 3000;

app.use(loggingMiddleware);
app.use(cookieParser());
app.use(Express.json());

app.get('/api/footer', serveFile('public/partials/footer.html'));
app.get('/api/header', serveFile('public/partials/header.html'));


app.post('/api/post-comment', Express.json(), async (request, response) => {
  console.log(request.body);
  const ads = await FirebaseTools.getAllAds();
  const ad = ads.find(ad => ad.id == parseInt(request.body.id));

  if (!ad) {
    response.status(404).json({});
    return;
  }

  ad.comments.push(request.body.comment);
  response.json({ad});
});

app.get('/api/config', (request, response) => {
  response.json({
    categories: allCategories,
  });
});

app.post('/api/ad/new', upload.single('image'), (request, response) => {
  FirebaseTools.newAd(request).then((item) => {
    response.json({
      ok: true
    });
  });
});

app.post('/api/ad/edit', upload.single('image'), (request, response) => {
  FirebaseTools.editAd(request).then((item) => {
    response.json({
      ok: true
    });
  });
});

app.get('/api/ad/:id', async (request, response) => {
  const ads = await FirebaseTools.getAllAds();
  const ad = ads.find(ad => ad.id == request.params.id);

  if (!ad) {
    response.status(404).json({});
    return;
  }

  response.json({ad});
});

/**
 * @param {Express.Request} request
 * @param {Express.Response} response
 */
app.get('/api/ads', async (request, response) => {
  const name = request.query['search'] ?? null;
  const categories = request.query['categories'] ?? null;
  const ads = await FirebaseTools.getAllAds();

  response.json(ads.filter(ad => {
    if (name !== null && !ad.name.toLowerCase().includes(name.toLowerCase())) {
      return false;
    }

    if (categories !== null && !categories.split(',').map(x => x.toLowerCase()).includes(ad.category.toLowerCase())) {
      return false;
    }

    return true;
  }));
});

app.get('/', serveFile('public/index.html'));
app.get('/login', serveFile('public/login.html'));
app.get('/register', serveFile('public/register.html'));
app.get('/edit-ad/:id', async(request, response) => {
  const auth = await FirebaseTools.getAuth(request);
  if (!auth.currentUser) {
    response.status(404).sendFile('public/404.html', {root: '.'});
    return;
  }

  const ads = await FirebaseTools.getAllAds();
  const ad = ads.find(ad => ad.id == request.params.id);

  if (!ad) {
    response.status(404).sendFile('public/404.html', {root: '.'});
    return;
  }

  const fileContents = fs.readFileSync('./public/edit-ad.html')
    .toString()
    .replaceAll('{{id}}', ad.id)
    .replaceAll('{{category}}', ad.category)
    .replaceAll('{{name}}', ad.name)
    .replaceAll('{{description}}', ad.description)
    .replaceAll('{{image}}', ad.pictureUrl)
    .replaceAll('{{likes}}', ad.likes)
    .replaceAll('{{price}}', ad.priceEur.toFixed(2))
  ;

  response.status(200).send(fileContents);
});

app.get('/ad-details/:id', async (request, response) => {
  const ads = await FirebaseTools.getAllAds();
  const ad = ads.find(ad => ad.id == request.params.id);

  if (!ad) {
    response.status(404).sendFile('public/404.html', {root: '.'});
    return;
  }

  const fileContents = fs.readFileSync('./public/ad-details.html')
    .toString()
    .replaceAll('{{id}}', ad.id)
    .replaceAll('{{category}}', ad.category)
    .replaceAll('{{name}}', ad.name)
    .replaceAll('{{description}}', ad.description)
    .replaceAll('{{image}}', ad.pictureUrl)
    .replaceAll('{{likes}}', ad.likes)
    .replaceAll('{{price}}', ad.priceEur.toFixed(2))
  ;

  response.status(200).send(fileContents);
});

app.get('/admin', async (request, response) => {
  const auth = await FirebaseTools.getAuth(request);
  if (!auth.currentUser) {
    response.status(404).sendFile('public/404.html', {root: '.'});

    return;
  }

  response.status(200).sendFile('public/admin.html', {root: '.'});
});

app.get('/new-ad', async (request, response) => {
  const auth = await FirebaseTools.getAuth(request);
  if (!auth.currentUser) {
    response.status(404).sendFile('public/404.html', {root: '.'});

    return;
  }

  response.status(200).sendFile('public/new-ad.html', {root: '.'});
});


app.get('/scripts/main.js', serveFile('public/scripts/main.js'));
app.get('/styles/main.css', serveFile('public/styles/main.css'));

app.post('/api/register', Express.json(), (request, response) => {
  FirebaseTools.createUser(request.body.email, request.body.password, request.body.displayName)
    .then(credentials => {
      response.json({
        ok: true,
      })
    })
    .catch(e => {
      response.json({
        ok: false,
        message: e.message,
      })
    })
  ;
});

app.post('/api/login', Express.json(), async (request, response) => {
  try {
    const userData = await FirebaseTools.login(request.body.email, request.body.password);
    userData.user.getIdToken(true)
    .then((token) => {
      response.cookie('Authorization', token)
      .json({
        ok: true,
        token
      });
    });
  } catch (e) {
    console.log('Error: ', e);
    response.json({
      ok: false,
      message: 'Prisijungti nepavyko',
    })
}
});

app.post('/api/like', Express.json(), async (request, response) => {
  const likes = await FirebaseTools.likeAd(request.body.id);

  response.json({
    ok: true,
    likes
  })
});

/**
 * 
 *     "email": "admin@admin.admin",
    "password": "admin123",
    "displayName": "Adminas"

 */

app.get('/api/user', async (request, response) => {
  const auth = await FirebaseTools.getAuth(request);

  response.json({
    user: auth.currentUser,
  })
});

app.delete('/api/delete-ad', async (request, response) => {
  try {

    const auth = await FirebaseTools.getAuth(request);
    if (!auth.currentUser) {
      response.json({
        ok: false,
        message: 'Nepavyko...'
      });
      return;
    }

    await FirebaseTools.deleteAd(request.body.id);
    response.json({
      ok: true
    });
  } catch(e) {
    response.json({
      ok: false,
      message: 'Nepavyko...'
    });
  }
});

app.get('*', serveFile('public/404.html', 404));
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});

