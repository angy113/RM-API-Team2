var expect = require('chai').expect;
var request = require('../../lib/RequestManager/manager.js');
var generator = require('../../utils/generator.js');
var dbQuery = require('../../lib/Conditions/dbQuery.js');
var config = require('../../config/config.json');
var helper = require('../../utils/helper.js');

describe("CRUD - Room Resources Service", function () {

    this.slow(config.timeSlow);
    this.timeout(config.timeOut);
    var room_ID = null, room_ID2 = null;
    var roomResourceId = null, totalResources = 0;
    var resourceBody = null;
    var resourceList = null;
    var resourceJSON = null;

    before(function (done) {
        request.authentication.postLogin(function (err, res) {
            done();
        });
    });

    beforeEach(function (done) {
        resourceBody = generator.generator_resource.generateResource();
        dbQuery.preCondition.insertResource(resourceBody, function (res) {
            roomResourceId = res._id;
            generator.generator_resource.setPropertiesResource(roomResourceId);
            dbQuery.preCondition.findAllRooms(function (res) {
                room_ID = res[0]._id;
                room_ID2 = res[1]._id;
                dbQuery.preCondition.addResourceToRoom(room_ID, resourceBody, function (err, res) {
                    dbQuery.preCondition.findRoom(room_ID, function (res) {
                        totalResources = res.resources.length;
                        resourceList = res.resources;
                        done();
                    });
                });
            });
        });
    });

    it('GET /rooms/{:roomId}/resources returns all room\'s resources by room Id', function (done) {
        request.resource.getResourcesByRoom(room_ID, function (err, res) {
            expect(totalResources).to.equal(res.body.length);
            var present = res.body.filter(element => helper.compareResourceByResourceId(resourceList,element.resourceId));
            expect(totalResources).to.equal(present.length);
            done();
        });
    });

    it('GET /rooms/{:roomId}/resources/{:roomResourceId} returns a specific resource from a specific room', function (done) {
        request.resource.getResourceByRoomId(room_ID, roomResourceId, function (err, res) {
            expect(resourceBody.resourceId.toString()).to.eql(res.body.resourceId);
            expect(resourceBody.quantity).to.equal(res.body.quantity.toString());
            done();
        });
    });

    it('PUT /rooms/{:roomId}/resources/{:roomResourceId} updates a specific resource from a specific room', function (done) {
        var quantity = generator.generateCapacity();
        var bodyJSON = {"quantity": quantity};
        request.resource.putResourceByRoom(room_ID, roomResourceId, bodyJSON, function (err, res) {
            var resourcesList = res.body.resources;
            var found = helper.compareResourceByResourceId(resourcesList, roomResourceId);
            expect(found.shift().quantity).to.equal(parseInt(quantity));
            done();
        });
    });

    it('DEL /rooms/{:roomId}/resources/{:roomResourceId} removes a specific resource from a specific room', function (done) {
        var found = false;
        request.resource.delResourceByRoom(room_ID, roomResourceId, function (err, res) {
            var resourcesList = res.body.resources;
            (resourcesList instanceof Array) ? found = [] : resourcesList = [];
            found = helper.compareResourceById(resourcesList, roomResourceId);
            expect(found).to.empty;
            done();
        });
    });

    it('POST /rooms/{:roomId}/resources associates a resource to a room', function (done) {
        resourceJSON = generator.generator_resource.generateResource();
        generator.generator_resource.setPropertiesResource(roomResourceId);
        request.resource.postResourceByRoomId(resourceJSON, room_ID2, function (err, res) {
            var resourcesList = res.body.resources;
            (resourcesList instanceof Array) ? found = [] : resourcesList = [];
            var found = helper.compareResourceByResourceId(resourcesList, roomResourceId);
            expect(found.shift().resourceId).to.equal(roomResourceId.toString());
            done();
        });

    });

    afterEach(function (done) {
        if (roomResourceId) {
            dbQuery.postCondition.removeResourceToRoom(room_ID, roomResourceId, function (res) {
                dbQuery.postCondition.removeResource(roomResourceId, function (res) {
                    done();
                });
            });
        }
        else {
            done();
        }
    });
    after(function (done) {
        dbQuery.postCondition.removeResourceToRoom(room_ID2, roomResourceId, function (err, res) {
            done();
        });
    });
});