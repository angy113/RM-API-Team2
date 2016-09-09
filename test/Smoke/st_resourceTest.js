var expect = require('chai').expect;
var request = require('../../lib/RequestManager/manager.js');
var generator = require('../../utils/generator.js');
var dbQuery = require('../../lib/Conditions/dbQuery.js');
var config = require('../../config/config.json');

describe("Smoke: Resource test without preconditions", function () {
    var resourceId;
    var roomResourceId;
    var room_ID;
    var serviceId;
    this.slow(config.timeSlow);
    this.timeout(config.timeOut);
    before(function (done) {
        request.authentication.postLogin(function (err, res) {
            dbQuery.preCondition.getRandomRoom(function (res) {
                room_ID = res._id;
                dbQuery.preCondition.findAllServices(function (res) {
                    serviceId = res[0]._id;
                    done();
                });
            });

        });
    });

    it('POST /resources, returns status code 200', function (done) {
        var body = generator.generator_resource.generateResource();
        request.resource.postResource(body, function (err, res) {
            resourceId = res.body._id;
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('POST /rooms/{:roomId}/resources, returns status code 200', function (done) {
        var resourceBody = generator.generator_resource.generateResource();
        generator.generator_resource.setPropertiesResource(resourceId);
        request.resource.postResourceByRoomId(resourceBody, room_ID, function (err, res) {
            roomResourceId = res.body.resources[0]._id;
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });
    it('GET /rooms/{:roomId}/resources, returns status code 200', function (done) {
        request.resource.getResourcesByRoom(room_ID, function (err, res) {
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });
    it('DEL /rooms/{:roomId}/resources/{:id}, returns status code 200', function (done) {
        request.resource.delResourceByRoom(room_ID, roomResourceId, function (err, res) {
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('POST /services/{:serviceId}/rooms/{:roomId}/resources, returns status code 200', function (done) {
        var body = generator.generator_resource.generateResource();
        generator.generator_resource.setPropertiesResource(resourceId);
        request.resource.postResourceByRoomOfService(body, serviceId, room_ID, function (err, res) {
            roomResourceId = res.body.resources[0]._id;
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('POST /rooms/{:roomId}/resources, returns 404 status code when a non-existent roomId is used.', function (done) {
        var nonExistentRoomId = generator.generateValues();
        var resourceBody = generator.generator_resource.generateResource();
        request.resource.postResourceByRoomId(resourceBody, nonExistentRoomId, function (err, res) {
            expect(res.status).to.equal(config.statusCode.NOT_FOUND);
            done();
        });
    });

    it('GET /services/{:serviceId}/rooms/{:roomId}/resources, returns status code 200', function (done) {
        request.resource.getResourcesByRoomOfService(serviceId, room_ID, function (err, res) {
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });
    it('DEL /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId}, returns status code 200', function (done) {
        request.resource.delResourceByRoomOfService(serviceId, room_ID, roomResourceId, function (err, res) {
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });


    it('PUT /resources/{:id}, returns status code 200', function (done) {
        var body = generator.generator_resource.generateResource();
        request.resource.putResource(resourceId, body, function (err, res) {
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('PUT /resources/{:id}, returns status code 404 when a non-existent resourceId is used', function (done) {
        var body = generator.generator_resource.generateResource();
        request.resource.putResource(generator.generateValues(), body, function (err, res) {
            expect(res.status).to.equal(config.statusCode.NOT_FOUND);
            done();
        });
    });

    it('GET /resources, returns status code 200', function (done) {
        request.resource.getResources(function (err, res) {
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('GET /resources/{:id}, returns status code 200', function (done) {
        request.resource.getResourceById(resourceId, function (err, res) {
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('GET /resources/{:id}, returns status code 404 when a non-existent resourceId is used', function (done) {
        request.resource.getResourceById(generator.generateValues(), function (err, res) {
            expect(res.status).to.equal(config.statusCode.NOT_FOUND);
            done();
        });
    });
    it('DEL /resources/{:id}, returns status code 200', function (done) {
        request.resource.delResource(resourceId, function (err, res) {
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });
    it('DEL /resources/{:id}, returns status code 404 when a non-existent resourceId is used', function (done) {
        request.resource.delResource(generator.generateValues(), function (err, res) {
            expect(res.status).to.equal(config.statusCode.NOT_FOUND);
            done();
        });
    });
});
