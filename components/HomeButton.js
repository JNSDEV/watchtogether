/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import '../scss/inputTorrent.scss';
import { useRouter } from 'next/router';

const HomeButton = props => {
  const router = useRouter();

  const homeAction = e => {
    e.preventDefault();
    const url = `/`;

    router.push(url);
    return false;
  };

  return (
    <button type="submit" onClick={homeAction}>
      Home
    </button>
  );
};

export default HomeButton;
