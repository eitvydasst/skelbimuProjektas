fetch('/api/header')
    .then(response => response.text())
    .then(html => {
        const element = document.getElementById('mainHeader');
        if (!element) {
            return;
        }

        element.outerHTML = html;
    })
    .then(() => {
        fetch('/api/user').then(r => r.json())
        .then(r => r.user)
        .then(user => {
            window.loggedInUser = user;
            if (user) {
                document.getElementById('loginTools').innerHTML = `<label class="text-white">${user.email}</label><br/><a href="/new-ad" class="text-white">Naujas skelbimas</a><br/><button onclick="logout()" class="btn btn-danger">Atsijungti</button>`;
            } else {
                Array.from(document.getElementsByClassName('admin-items-container')).forEach(element => {
                    element.remove();
                });
            }
        })
    ;
    })
;

const logout = () => {
    document.cookie = 'Authorization= ; Max-Age=0';
    window.location.reload();
};

fetch('/api/footer')
    .then(response => response.text())
    .then(html => {
        const element = document.getElementById('mainFooter');
        if (!element) {
            return;
        }

        element.outerHTML = html;
    });

async function doSearch(search, categories) {
    const finalObject = {};
    if (search) {
        finalObject.search = search;
    }
    if (categories && categories.length > 0) {
        finalObject.categories = categories;
    }

    return fetch(`/api/ads?${new URLSearchParams(finalObject).toString()}`)
        .then(response => response.json());
};

fetch('/api/config').then(response => response.json()).then(config => {
    window.siteConfig = config;
});

