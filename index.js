const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static('public'));

async function fetchArticle(slug) {
  const url = `https://lproudhom.online/wp-json/wp/v2/posts?slug=${slug}`;
  const response = await axios.get(url);
  if (response.data.length > 0) {
    return response.data[0];
  } else {
    throw new Error('Article non trouvé');
  }
}

async function fetchArticles() {
  const url = 'https://lproudhom.online/wp-json/wp/v2/posts';
  const response = await axios.get(url);
  return response.data;
}


const findThumbnail = (content) => {
  const regex = /<img.*?src=["'](.*?)["']/;
  const match = content.match(regex);
  return match ? match[1] : null;
};


function stripTags(html) {
  return html.replace(/<[^>]*>?/gm, '');
}


// Page d'accueil
app.get('/', function(req, res) {
  axios.get('https://lproudhom.online/wp-json/wp/v2/posts?per_page=1')
  .then(response => {
    res.render('index', { latestPost: response.data[0] });
  })
  .catch(error => {
    console.log(error);
  });
});

// Page de tous les articles
app.get('/articles', function(req, res) {
  axios.get('https://lproudhom.online/wp-json/wp/v2/posts')
  .then(response => {
    res.render('articles', { posts: response.data });
  })
  .catch(error => {
    console.log(error);
  });
});

app.get('/article/:slug', async (req, res) => {
  try {
    const article = await fetchArticle(req.params.slug);
    res.render('article', { article });
  } catch (error) {
    console.error(error);
    res.status(404).send('Article non trouvé');
  }
});

app.get('/projects', async (req, res) => {
  try {
    const articles = await fetchArticles();
    const projects = articles.map((article) => {
      const thumbnail = findThumbnail(article.content.rendered);
      return {
        title: article.title.rendered,
        date: new Date(Date.parse(article.date)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        excerpt: stripTags(article.excerpt.rendered),
        slug: article.slug,
        thumbnail: thumbnail,
      };
    });
    res.render('projects', { articles: projects });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de la récupération des articles');
  }
});

app.get('/about', (req, res) => {
  res.render('about');
});

// Route pour envoyer un email
app.post('/send-email', async (req, res) => {
  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WORDPRESS_TOKEN}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    console.log(data);
    res.send('Email envoyé');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'envoi de l\'email');
  }
});



app.listen(3000, function() {
  console.log('Server is running on port 3000');
});


// Export de app pour permettre à Vercel de charger l'application
module.exports = app;