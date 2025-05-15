const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('nav'); // Cibler l'élément <nav> directement
let deferredPrompt;
const installBanner = document.getElementById('install-banner');
const installButtonBanner = document.getElementById('install-button-banner');
const dismissButtonBanner = document.getElementById('dismiss-button-banner');

navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
    navToggle.setAttribute('aria-expanded', !expanded);
    navLinks.classList.toggle('open'); // Ajouter ou supprimer la classe 'open'
});

// Fermer le menu lorsqu'un lien est cliqué (optionnel)
const navListItems = document.querySelectorAll('nav ul li a'); // Sélectionner les liens

navListItems.forEach(item => {
    item.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', false);
        navLinks.classList.remove('open'); // Retirer la classe 'open' pour fermer
    });
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/js/cv-data.js')
        .then(response => response.json())
        .then(data => {
            afficherAccueil(data);
            afficherParcours(data.parcours);
            afficherExperience(data.experience);
            afficherCompetences(data.competences);
            afficherPartage(data.partage);
        })
        .catch(error => console.error('Erreur lors du chargement des données du CV:', error));
});

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt fired');
    e.preventDefault();
    deferredPrompt = e;

    // Afficher la bannière d'installation
    if (installBanner) {
        installBanner.style.display = 'flex'; // Utiliser flex pour l'alignement
    }

    if (installButtonBanner) {
        installButtonBanner.addEventListener('click', () => {
            console.log('Install button clicked');
            console.log('deferredPrompt is:', deferredPrompt);
            if (deferredPrompt) {
                console.log('Calling deferredPrompt.prompt()');
                deferredPrompt.prompt().then(() => { // Ajouter un .then() après prompt()
                    console.log('deferredPrompt.prompt() resolved');
                    return deferredPrompt.userChoice; // Retourner la promesse userChoice
                }).then((choiceResult) => {
                    console.log('User choice promise resolved:', choiceResult);
                    console.log('User choice outcome:', choiceResult.outcome);
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the A2HS prompt');
                    } else {
                        console.log('User dismissed the A2HS prompt');
                    }
                    deferredPrompt = null;
                    if (installBanner) {
                        installBanner.style.display = 'none'; // Masquer la bannière après l'interaction
                    }
                }).catch(error => {
                    console.error('Error during prompt or userChoice:', error); // Log pour les erreurs potentielles
                });
            } else {
                console.log('deferredPrompt is null, cannot prompt.');
            }
        });
    }

    if (dismissButtonBanner) {
        dismissButtonBanner.addEventListener('click', () => {
            if (installBanner) {
                installBanner.style.display = 'none'; // Masquer la bannière si l'utilisateur clique sur "Peut-être plus tard"
            }
        });
    }
});

window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed');
    if (installBanner) {
        installBanner.style.display = 'none'; // Masquer la bannière si l'application est déjà installée
    }
});

function afficherAccueil(data) {
    const accueilSection = document.getElementById('accueil');
    if (accueilSection) {
        let contenuAccueil = '';
        if (data.photo) {
            contenuAccueil += `<img src="${data.photo}" alt="Ma photo de profil">`;
        }
        if (data.nom) {
            contenuAccueil += `<h1><i class="mdi mdi-account"></i> ${data.nom}</h1>`;
        }
        if (data.specialite) {
            contenuAccueil += `<p><i class="mdi mdi-briefcase"></i> ${data.specialite}</p>`;
        }
        accueilSection.innerHTML = contenuAccueil;

        if (data.accueil_cliquable) {
            accueilSection.style.cursor = 'pointer';
            accueilSection.addEventListener('click', () => {
                const cvSection = document.getElementById('parcours');
                if (cvSection) {
                    cvSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }
}

function afficherParcours(parcours) {
    const parcoursSection = document.getElementById('parcours');
    if (parcoursSection) {
        let contenuParcours = `<h2><i class="mdi mdi-school"></i> ${parcours.titre || 'Parcours'}</h2>`;
        if (parcours.texte) {
            contenuParcours += `<p><i class="mdi mdi-book-open-variant"></i> ${parcours.texte}</p>`;
        }
        if (parcours.audio) {
            contenuParcours += `<p><i class="mdi mdi-headphones"></i> <audio controls src="${parcours.audio}"></audio></p>`;
        }
        if (parcours.video) {
            contenuParcours += `<p><i class="mdi mdi-video"></i> <video controls width="320" height="240" src="${parcours.video}"></video></p>`;
        }
        parcoursSection.innerHTML = contenuParcours;
    }
}

function afficherExperience(experiences) {
    const experienceSection = document.getElementById('experience');
    if (experienceSection) {
        let contenuExperience = `<h2><i class="mdi mdi-briefcase"></i> Expérience</h2>`;
        experiences.forEach(exp => {
            contenuExperience += `
                    <div class="experience-item">
                        <h3><i class="mdi mdi-office-building"></i> ${exp.titre}</h3>
                        <p class="entreprise"><i class="mdi mdi-map-marker"></i> ${exp.entreprise} - <i class="mdi mdi-calendar-range"></i> ${exp.dates}</p>
                        <p><i class="mdi mdi-format-list-bulleted"></i> ${exp.texte}</p>
            `;
            if (exp.audio) {
                contenuExperience += `<p><i class="mdi mdi-headphones"></i> <audio controls src="${exp.audio}"></p>`;
            }
            if (exp.video) {
                contenuExperience += `<p><i class="mdi mdi-video"></i> <video controls width="320" height="240" src="${exp.video}"></video></p>`;
            }
            contenuExperience += `</div>`;
        });
        experienceSection.innerHTML = contenuExperience;
    }
}

function afficherCompetences(competences) {
    const competencesSection = document.getElementById('competences');
    if (competencesSection) {
        let contenuCompetences = `<h2><i class="mdi mdi-wrench"></i> ${competences.titre || 'Compétences'}</h2>`;
        if (competences.principales && competences.principales.length > 0) {
            contenuCompetences += `<h3><i class="mdi mdi-check-all"></i> Compétences Clés</h3><ul>`;
            competences.principales.forEach(competence => {
                contenuCompetences += `<li><i class="mdi mdi-tag"></i> ${competence}</li>`;
            });
            contenuCompetences += `</ul>`;
        }
        if (competences.details) {
            contenuCompetences += `<p><i class="mdi mdi-information"></i> ${competences.details}</p>`;
        }
        if (competences.audio) {
            contenuCompetences += `<p><i class="mdi mdi-headphones"></i> <audio controls src="${competences.audio}"></p>`;
        }
        if (competences.video) {
            contenuCompetences += `<p><i class="mdi mdi-video"></i> <video controls width="320" height="240" src="${competences.video}"></video></p>`;
        }
        competencesSection.innerHTML = contenuCompetences;
    }
}

function afficherPartage(partage) {
    const partageSection = document.getElementById('partage');
    if (partageSection) {
        let contenuPartage = `<h2><i class="mdi mdi-share-variant"></i> ${partage.titre || 'Partager'}</h2>`;
        contenuPartage += `
                <div class="share-buttons">
                    <a href="#" onclick="shareCV('whatsapp')" title="Partager sur WhatsApp" class="whatsapp"><i class="mdi mdi-whatsapp"></i> WhatsApp</a>
                    <a href="#" onclick="shareCV('facebook')" title="Partager sur Facebook" class="facebook"><i class="mdi mdi-facebook"></i> Facebook</a>
                    <a href="#" onclick="shareCV('email')" title="Partager par Email" class="email"><i class="mdi mdi-email"></i> Email</a>
                    <button onclick="copyLink()" title="Copier le lien"><i class="mdi mdi-link"></i> Lien</button>
                </div>
        `;
        partageSection.innerHTML = contenuPartage;
    }
}

function shareCV(platform) {
    let shareUrl = window.location.href;
    let message = "Consultez mon CV multimédia !";

    switch (platform) {
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(message + ' ' + shareUrl)}`, '_blank');
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
            break;
        case 'email':
            window.open(`mailto:?subject=${encodeURIComponent("Mon CV Multimédia")}&body=${encodeURIComponent(message + '\n' + shareUrl)}`, '_blank');
            break;
    }
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Lien copié dans le presse-papiers !');
    }).catch(err => {
        console.error('Erreur lors de la copie du lien:', err);
        alert('Impossible de copier le lien.');
    });
}