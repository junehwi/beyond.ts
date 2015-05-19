import assert = require('assert');
import Future = require('../lib/future');

describe('Future', function () {
  describe('constructor', function () {
    it('returns a Future object with a callback', function () {
      let future = Future.create(function () {
        return;
      });
      assert.equal(future.constructor, Future);
    });
  });

  describe('#onComplete', function () {
    it('registers a success callback.', function (done) {
      let future = Future.successful(10);
      future.onComplete(function (result, isSuccess) {
        assert.equal(result, 10);
        assert.equal(isSuccess, true);
        done();
      });
    });

    it('registers a failure callback.', function (done) {
      let future = Future.failed(new Error('hello, error!'));
      future.onComplete(function (err: Error, isSuccess) {
        assert.equal(err.message, 'hello, error!');
        assert.equal(isSuccess, false);
        done();
      });
    });
  });

  describe('#onSuccess', function () {
    it('registers a success callback.', function (done) {
      let future = Future.successful(10);
      future.onSuccess(function (result) {
        assert.equal(result, 10);
        done();
      });
    });
  });

  describe('#onFailure', function () {
    it('registers a failure callback.', function (done) {
      let future = Future.failed(new Error('hello, error!'));
      future.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      });
    });
  });

  describe('#map', function () {
    it('maps the result of a Future into another result.', function (done) {
      let future = Future.successful(10);
      let mapedFuture = future.map(function (result: number) {
        return result + ' times!';
      });
      mapedFuture.onSuccess(function (result: string) {
        assert.equal(result, '10 times!');
        done();
      });
    });

    it('throws error when the original future throws error.', function (done) {
      let future = Future.failed(new Error('hello, error!'));
      let mapedFuture = future.map(function (result: number) {
        return result + ' times!';
      });
      mapedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      });
    });
  });

  describe('#flatMap', function () {
    it('maps the result of a Future into another futured result.', function (done) {
      let future = Future.successful(10);
      let flatMappedFuture = future.flatMap(function (result: number) {
        let future = Future.successful(result + ' times!');
        return future;
      });
      flatMappedFuture.onSuccess(function (result: string) {
        assert.equal(result, '10 times!');
        done();
      });
    });

    it('throws error when the original future throws error.', function (done) {
      let future = Future.failed(new Error('hello, error!'));
      let flatMappedFuture = future.flatMap(function (result: number) {
        let future = Future.successful(result + ' times!');
        return future;
      });
      flatMappedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      });
    });

    it('throws error when a mapped future throws error.', function (done) {
      let future = Future.successful(10);
      let flatMappedFuture = future.flatMap(function (result: number): Future<number> {
        throw new Error('hello, error!');
      });
      flatMappedFuture.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      });
    });
  });

  describe('#sequence', function () {
    it('collects futures and returns a new future of their results.', function (done) {
      let future: Future<any[]> = Future.sequence(
        Future.successful(10),
        Future.successful('hello'),
        Future.successful(20)
      );
      future.onSuccess(function (results) {
        assert.equal(results[0], 10);
        assert.equal(results[1], 'hello');
        assert.equal(results[2], 20);
        done();
      });
    });

    it('throws an error when any of futures has failed.', function (done) {
      let future: Future<any[]> = Future.sequence(
        Future.failed(new Error('hello, error!')),
        Future.successful(10),
        Future.successful('hello')
      );
      future.onFailure(function (err) {
        assert.equal(err.message, 'hello, error!');
        done();
      });
    });
  });

  describe('#successful', function () {
    it('creates an already completed successful future with the specified result.', function (done) {
      let future = Future.successful('hello');
      future.onSuccess(function (result: string) {
        assert.equal(result, 'hello');
        done();
      });
    });
  });
});
