(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (angular) {
  angular.module('d10-session', ['d10-rest']).service('d10session', function (d10API, $rootScope) {

    var sessionEventNamespace = 'd10:session';

    function getEventName(action) {
      var suffix = Array.isArray(action) ? action.join(':') : action;

      return sessionEventNamespace + ':' + suffix;
    }

    var D10Session = function () {
      function D10Session(d10API, pubsub) {
        _classCallCheck(this, D10Session);

        this.d10API = d10API;
        this._pubsub = pubsub;
        this._isStarted = false;
        this._isLogged = null;
        this.userinfos = null;
      }

      _createClass(D10Session, [{
        key: '_setLogged',
        value: function _setLogged(userinfos) {
          this._isLogged = true;
          this._isStarted = false;
          this.userinfos = userinfos;
        }
      }, {
        key: '_setNotLogged',
        value: function _setNotLogged() {
          this._isLogged = false;
          this._isStarted = false;
          this.userinfos = null;
        }
      }, {
        key: 'start',
        value: function start() {
          var _this = this;

          if (this._isStarted) {
            return;
          }
          this._isStarted = true;

          this._pubsub.$broadcast(getEventName('start'));

          return d10API.getUserinfos().then(function (userinfos) {
            _this._setLogged(userinfos);
          }, function () {
            _this._setNotLogged();
          }).then(function () {
            if (_this._isStarted) {
              _this._pubsub.$broadcast(getEventName(['start', 'success']));

              return _this._isStarted;
            } else {
              _this._pubsub.$broadcast(getEventName(['start', 'error']));
              throw new Error('User is not logged');
            }
          });
        }
      }, {
        key: 'login',
        value: function login(username, password) {
          var _this2 = this;

          this._pubsub.$broadcast(getEventName('login'));

          return d10API.login(username, password).then(function (response) {
            _this2._pubsub.$broadcast(getEventName(['login', 'success']), response);

            return _this2.start();
          }, function (err) {
            _this2._pubsub.$broadcast(getEventName(['login', 'error']));
            throw err;
          });
        }
      }, {
        key: 'isLogged',
        value: function isLogged() {
          return this._isLogged;
        }
      }, {
        key: 'isStarted',
        value: function isStarted() {
          return this._isStarted;
        }
      }, {
        key: 'getUserinfos',
        value: function getUserinfos() {
          return this.userinfos;
        }
      }]);

      return D10Session;
    }();

    return new D10Session(d10API, $rootScope);
  });
})(angular);

},{}]},{},[1]);
