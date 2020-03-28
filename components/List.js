import Movie from './Movie';
import '../scss/list.scss';

const List = props => (
  // console.log(props.movies);

  <div>
    <h1>{props.title}</h1>
    <div className="list-container">
      {props.movies.map(movie => (
        <Movie key={movie._id} movie={movie} class="list-entry" />
      ))}
    </div>
  </div>
);
export default List;
