// =============================================
// ASTROQUEST HUB
// Junior Astronaut Mission Trainer
// =============================================


// ================= NAVIGATION =================

const navItems =
    document.querySelectorAll(".nav-item");

const pages =
    document.querySelectorAll(".page");


const pageInfo = {

    dashboard: [
        "Mission Dashboard",
        "Prepare for your next space mission."
    ],

    training: [
        "Training Center",
        "Build the skills required for space exploration."
    ],

    missions: [
        "Mission Center",
        "Choose your next space adventure."
    ],

    achievements: [
        "Achievements",
        "Milestones earned during your astronaut journey."
    ],

    profile: [
        "My Astronaut",
        "Track your skills and mission progress."
    ],

    settings: [
        "Settings",
        "Customize your Astroquest Hub experience."
    ]

};


function showPage(pageName) {

    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    const page =
        document.getElementById(pageName);


    if (page) {

        page.classList.add(
            "active-page"
        );

    }


    navItems.forEach(item => {

        item.classList.remove("active");


        if (
            item.dataset.page === pageName
        ) {

            item.classList.add("active");

        }

    });


    if (pageInfo[pageName]) {

        document.getElementById(
            "pageTitle"
        ).textContent =
            pageInfo[pageName][0];


        document.getElementById(
            "pageSubtitle"
        ).textContent =
            pageInfo[pageName][1];

    }


    document
        .getElementById("sidebar")
        .classList.remove("open");
}


navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            showPage(
                item.dataset.page
            );

        }
    );

});


// ================= MOBILE MENU =================

document
    .getElementById("mobileMenu")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("sidebar")
                .classList.toggle("open");

        }
    );


// ================= DARK MODE =================

const themeButton =
    document.getElementById(
        "themeButton"
    );

const darkModeToggle =
    document.getElementById(
        "darkModeToggle"
    );


function updateThemeIcon() {

    const dark =
        !document.body.classList.contains(
            "light"
        );

    themeButton.textContent =
        dark ? "☀️" : "🌙";


    if (darkModeToggle) {

        darkModeToggle.checked =
            dark;

    }

}


themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );

        updateThemeIcon();

    }
);


darkModeToggle.addEventListener(
    "change",
    () => {

        if (
            darkModeToggle.checked
        ) {

            document.body.classList.remove(
                "light"
            );

        } else {

            document.body.classList.add(
                "light"
            );

        }

        updateThemeIcon();

    }
);


// ================= MISSION =================

function startMission() {

    showPage(
        "mission-control"
    );

}




// ================= INITIALIZATION =================

updateThemeIcon();


console.log(
    "🚀 Astroquest Hub loaded successfully!"
);