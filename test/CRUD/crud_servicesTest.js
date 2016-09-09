var expect = require('chai').expect;
var request = require('../../lib/RequestManager/manager.js');
var generator = require('../../utils/generator.js');
var dbQuery = require('../../lib/Conditions/dbQuery.js');
var config = require('../../config/config.json');

describe('CRUD: methods for API-Services ', function () {

    this.slow(config.timeSlow);
    this.timeout(config.timeOut);
    var serviceId;
    var serviceIdPost;

    before(function (done) {
        request.authentication.postLogin(function (err, res) {
            dbQuery.preCondition.findAllServices(function (res) {
                serviceId = res[0]._id;
                if (serviceId != null) {
                    request.services.delService(serviceId, function (err, res) {
                        expect(res.status).to.equal(config.statusCode.OK);
                        done();
                    });
                }
            });
        });
    });

    after(function (done) {
        var serviceType = generator.generator_service.getType();
        var body = config.exchange;
        request.services.postService(serviceType.exchange, body, function (err, res) {
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });

    });
    it('POST /services?type={service type}  creates a new service', function (done) {
        var body = config.exchange;
        var serviceType = generator.generator_service.getType();
        request.services.postService(serviceType.exchange, body, function (err, res) {
            var actualResult = res.body;
            serviceIdPost = res.body._id;
            dbQuery.assertion.verifyServiceExist(res.body._id, function (result) {
                expect(result.type).to.equal(actualResult.type);
                expect(result.name).to.equal(actualResult.name);
                expect(result.serviceUrl).to.equal(actualResult.serviceUrl);
                done();
            });
        });
    });

    it('GET /services returns all services', function (done) {
        request.services.getServices(function (err, res) {
            var actualResult = res.body.length;
            dbQuery.assertion.verifyAllServices(function (result) {
                expect(actualResult).to.equal(result.length);
                done();
            });
        });
    });

    it('GET /services/{:serviceId} returns the service specified', function (done) {
        request.services.getServiceById(serviceIdPost, function (err, res) {
            var actualResult = res.body;
            dbQuery.assertion.verifyServiceExist(res.body._id, function (result) {
                expect(result.type).to.equal(actualResult.type);
                expect(result.name).to.equal(actualResult.name);
                expect(result.serviceUrl).to.equal(actualResult.serviceUrl);
                done();
            });
        });
    });

    it('GET /services?type={service type}, returns services with the type specified', function (done) {
        var serviceType = generator.generator_service.getType();
        request.services.getServiceByType(serviceType.exchange, function (err, res) {
            var actualResult = res.body.length;
            dbQuery.assertion.verifyAllServices(function (result) {
                expect(actualResult).to.equal(result.length);
                done();
            });
        });
    });

    it('PUT /services/{service type}, updates the impersonation to enabled', function (done) {
        var body = {impersonate: true};
        request.services.putService(serviceIdPost, body, function (err, res) {
            var actualResult = res.body
            dbQuery.assertion.verifyAllServices(function (result) {
                expect(actualResult.impersonate).to.equal(result[0].impersonate);
                done();
            });
        });
    });

    it('DEL /services/{:serviceId} delete the service specified', function (done) {
        request.services.delService(serviceIdPost, function (err, res) {
            dbQuery.assertion.verifyServiceExist(res.body._id, function (result) {
                expect(undefined).to.equal(result);
                done();
            });
        });
    });

});