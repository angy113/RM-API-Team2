var expect = require('chai').expect;
var request = require('../../lib/RequestManager/manager.js');
var generator = require('../../utils/generator.js');
var dbQuery = require('../../lib/Conditions/dbQuery.js');
var config = require('../../config/config.json');
var helper = require('../../utils/helper.js');

describe("CRUD - Room Resources Service", function () {

    this.slow(config.timeSlow);
    this.timeout(config.timeOut);
    var room_ID;
    var resourceId;
    var roomResourceId, totalResources;
    var resourceBody;
    var resourceList;
    var resourceJSON;

    before(function (done) {
        request.authentication.postLogin(function (err, res) {
            resourceBody = generator.generator_resource.generateResource();
            dbQuery.preCondition.insertResource(resourceBody, function (res) {
                roomResourceId = res._id;
                dbQuery.preCondition.getRandomRoom(function (res) {
                    room_ID = res._id;
                    done();
                });
            });
        });
    });

    it('POST /rooms/{:roomId}/resources associates a resource to a room', function (done) {
        resourceJSON = generator.generator_resource.generateResource();
        generator.generator_resource.setPropertiesResource(roomResourceId);
        request.resource.postResourceByRoomId(resourceJSON, room_ID, function (err, res) {
            resourceList = res.body.resources;
            totalResources = res.body.resources.length;
            (resourceList instanceof Array) ? found = [] : resourceList = [];
            var found = helper.compareResourceByResourceId(resourceList, roomResourceId);
            resourceId = found[0]._id;
            expect(found.shift().resourceId).to.equal(roomResourceId.toString());
            done();
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
        request.resource.getResourceByRoomId(room_ID, resourceId, function (err, res) {
            expect(resourceBody.resourceId.toString()).to.equal(res.body.resourceId);
            expect(parseInt(resourceBody.quantity)).to.equal(res.body.quantity);
            done();
        });
    });

    it('PUT /rooms/{:roomId}/resources/{:roomResourceId} updates a specific resource from a specific room', function (done) {
        var quantity = generator.generateCapacity();
        var bodyJSON = {"quantity": quantity};
        request.resource.putResourceByRoom(room_ID, resourceId , bodyJSON, function (err, res) {
            var resourcesList = res.body.resources;
            var found = helper.compareResourceByResourceId(resourcesList, roomResourceId);
            expect(found.shift().quantity).to.equal(parseInt(quantity));
            done();
        });
    });

    it('DEL /rooms/{:roomId}/resources/{:roomResourceId} removes a specific resource from a specific room', function (done) {
        request.resource.delResourceByRoom(room_ID, resourceId, function (err, res) {
            var resourcesList = res.body.resources;
            (resourcesList instanceof Array) ? null : resourcesList = [];
            var found = helper.compareResourceById(resourcesList, roomResourceId);
            expect(found).to.empty;
            done();
        });
    });
    after(function (done) {
        if (roomResourceId !== undefined) {
            dbQuery.removeResource(roomResourceId, function () {
                done();
            });
        }
    });
});