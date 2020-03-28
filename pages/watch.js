/* eslint-disable no-restricted-globals */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-access-state-in-setstate */
import { Component } from 'react';
import '../scss/watch.scss';
import { Line } from 'rc-progress';
import * as timesync from 'timesync';
import io from 'socket.io-client';
import HomeButton from '../components/HomeButton';

class Watch extends Component {
  static getInitialProps({ query: { stream } }) {
    return { stream };
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      progress: 0,
      client: null,
      send: true,
      startTime: null,
      latency: 0,
      socket: null,
      stream: encodeURIComponent(this.props.stream),
    };
  }

  async componentDidMount() {
    const { stream } = this.state;

    const _this = this;

    this.setState({
      ...this.state,
    });

    this.setState(
      {
        socket: io('http://127.0.0.1:3001'),
      },
      () => {
        const ts = timesync.create({
          server: this.state.socket,
          interval: null,
        });

        ts.on('sync', function(state) {
          console.log(`sync ${state}`);
        });

        ts.on('change', function(offset) {
          console.log(`changed offset: ${offset} ms`);
        });

        this.state.socket.on('timesync', function(data) {
          console.log(_this.state.startTime);

          if (!_this.state.loading && _this.state.startTime != null) {
            console.log(
              (data.result - _this.state.startTime) / 1000 -
                document.getElementById('video').currentTime
            );
            if (
              (data.result - _this.state.startTime) / 1000 -
                document.getElementById('video').currentTime >=
              0.2
            ) {
              document.getElementById('video').currentTime =
                (data.result - _this.state.startTime) / 1000;
            }

            _this.setState({
              startTime: _this.state.startTime,
            });
          } else {
            console.log('start is null');
            _this.setState({
              startTime: data.result,
            });
          }
        });
      }
    );

    fetch(`/add/${stream}`)
      .then(res => {
        console.log(res);
        clearInterval(this.state.interval);
        this.setState({
          ...this.state,
          loading: false,
        });
      })
      .catch(error => {
        console.error(error);
        clearInterval(this.state.interval);
        this.setState({
          ...this.state,
          // loading: false,
        });
      });

    this.getProgress(stream);
  }

  getProgress = stream => {
    if (this.state.loading) {
      const _this = this;

      fetch(`/progress/${stream}`)
        .then(resp => resp.json())
        .then(function(data) {
          _this.setState({
            ..._this.state,
            progress: data,
            loading: data !== 1,
          });

          if (data === 1) {
            _this.state.socket.emit('timesync');

            setInterval(function() {
              _this.state.socket.emit('timesync', 'test');
            }, 1000);
          }
          setTimeout(function() {
            _this.getProgress(stream);
          }, 5000);
        });
    }
  };

  render() {
    if (this.state.loading) {
      return (
        <div>
          <HomeButton />
          <div className="loading-bar">
            <Line
              className="progress"
              strokeColor="green"
              percent={this.state.progress * 100}
            />
            <div>Loading!</div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <HomeButton />
        <div className="video-container">
          <video
            id="video"
            autoPlay
            src={`/api/stream/${this.state.stream}`}
            height="360px"
            controls
            onTimeUpdate={this.timeUpdate}
          />
        </div>
      </div>
    );
  }
}

export default Watch;
