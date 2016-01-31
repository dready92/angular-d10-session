'use strict';

(function (angular) {
  angular.module('d10-session', ['d10-rest'])
  .service('d10session', function (d10API, $rootScope) {

    const sessionEventNamespace = 'd10:session';

    function getEventName(action) {
      let suffix = Array.isArray(action) ? action.join(':') : action;

      return sessionEventNamespace + ':' + suffix;
    }

    class D10Session {

      constructor(d10API, pubsub) {
        this.d10API = d10API;
        this._pubsub = pubsub;
        this._isStarted = false;
        this._isLogged = null;
        this.userinfos = null;
      }

      _setLogged(userinfos) {
        this._isLogged = true;
        this._isStarted = true;
        this.userinfos = userinfos;
      }

      _setNotLogged() {
        this._isLogged = false;
        this._isStarted = false;
        this.userinfos = null;
      }

      start() {
        if (this._isStarted) {
          return;
        }
        this._isStarted = true;

        this._pubsub.$broadcast(getEventName('start'));

        return d10API.getUserinfos().then((userinfos) => {
          this._setLogged(userinfos);
        }, () => {
          this._setNotLogged();
        })
        .then(() => {
          if (this._isStarted) {
            this._pubsub.$broadcast(getEventName(['start', 'success']));

            return this._isStarted;
          } else {
            this._pubsub.$broadcast(getEventName(['start', 'error']));
            throw new Error('User is not logged');
          }
        });
      }

      login(username, password) {
        this._pubsub.$broadcast(getEventName('login'));

        return d10API.login(username, password)
        .then((response) => {
          this._pubsub.$broadcast(getEventName(['login', 'success']), response);

          return this.start();
        }, (err) => {
          this._pubsub.$broadcast(getEventName(['login', 'error']));
          throw err;
        });
      }

      isLogged() {
        return this._isLogged;
      }

      isStarted() {
        return this._isStarted;
      }

      getUserinfos() {
        return this.userinfos;
      }

    }

    return new D10Session(d10API, $rootScope);

  });
})(angular);
