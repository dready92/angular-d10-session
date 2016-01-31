'use strict';

(function (angular) {
  angular.module('d10-session', ['d10-rest'])
  .service('d10session', function (d10API, $interval, $rootScope) {

    const sessionEventNamespace = 'd10:session';

    function getEventName(action) {
      let suffix = Array.isArray(action) ? action.join(':') : action;

      return sessionEventNamespace + ':' + suffix;
    }

    class D10Session {

      constructor(d10API, interval, pubsub) {
        this.d10API = d10API;
        this._interval = interval;
        this._pubsub = pubsub;
        this._currentPromise = null;
        this._isStarted = false;
        this._isLogged = null;
        this.userinfos = null;
      }

      _setLogged(userinfos) {
        this._isLogged = true;
        this.userinfos = userinfos;
      }

      _setNotLogged() {
        if (this._currentPromise) {
          this._interval.cancel(this._currentPromise);
          this._isLogged = false;
          this._isStarted = false;
        }
      }

      start() {
        if (this._isStarted) {
          return;
        }
        this._pubsub.$broadcast(getEventName('start'));
        this._isStarted = true;

        return d10API.getUserinfos().then((userinfos) => {
          this._setLogged(userinfos);
        }, () => {
          this._setNotLogged();
        })
        .then(() => {
          if (this._isStarted) {
            this._pubsub.$broadcast(getEventName(['start', 'success']));
          } else {
            this._pubsub.$broadcast(getEventName(['start', 'error']));
          }

          return this._isStarted;
        });
      }

      login(username, password) {
        this._pubsub.$broadcast(getEventName('login'));

        return d10API.login(username, password)
        .then((response) => {
          this._pubsub.$broadcast(getEventName(['login', 'success']));
          this.start();

          return response;
        }, (err) => {
          this._pubsub.$broadcast(getEventName(['login', 'error']));
          throw err;
        });
      }
    }

    return new D10Session(d10API, $interval, $rootScope);

  });
})(angular);
