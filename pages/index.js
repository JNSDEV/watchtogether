import Head from 'next/head';
import fetch from 'isomorphic-unfetch';
import List from '../components/List';
import '../scss/main.scss';
import InputTorrent from '../components/InputTorrent';

const Home = props => {
  // eslint-disable-next-line react/prop-types
  const { movies } = props;
  return (
    <div className="container">
      <Head>
        <title>Watch Together | home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="participants" />

      <div className="picks" />

      <div className="own">
        <InputTorrent />
      </div>
      <div className="list">
        <List title="movies" movies={movies} />
      </div>
    </div>
  );
};

Home.getInitialProps = async function() {
  const baseUrl = 'https://tv-v2.api-fetch.website';
  const page = 1;
  const sort = 'trending';
  const order = 1;
  const genre = '';
  const keywords = '';

  const data = await fetch(
    `${baseUrl}/movies/${page}?sort=${sort}&order=${order}&genre=${genre}&keywords=${keywords}`
  ).then(function(res) {
    console.log(res.status);

    if (res.status === 200) {
      return res.json();
    }

    return [];
  });

  return {
    movies: data,
  };
};

export default Home;
