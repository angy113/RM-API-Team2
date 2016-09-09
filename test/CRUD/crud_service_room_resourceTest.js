var expect = require('chai').expect;
var request = require('../../lib/RequestManager/manager.js');
var generator = require('../../utils/generator.js');
var dbQuery = require('../../lib/Conditions/dbQuery.js');
var config = require('../../config/config.json');
var helper = require('../../utils/helper.js');

describe("CRUD - Room Resources Service", function(){

    this.slow(config.timeSlow);
    this.timeout(config.timeOut);
    var serviceId, room_ID;
    var roomResourceId, totalResources;
    var resourceId;
    var resourceBody;
    var resourceList;
    var resourceJSON;

    before(function (done) {
        request.authentication.postLogin(function (err, res) {
            resourceBody = generator.generator_resource.generateResource();
            dbQuery.preCondition.insertResource(resourceBody, function (res) {
                resourceId = res._id;
                dbQuery.preCondition.findAllServices(function(res){
                    serviceId = res[0]._id;
                    dbQuery.preCondition.getRandomRoom(function(res){
                        room_ID = res._id;
                        done();
                    });
                });
            });
        });
    });

    it('POST /services/{:serviceId}/rooms/{:roomId}/resources associates a resource to a room', function(done){
        resourceJSON = generator.generator_resource.generateResource();
        generator.generator_resource.setPropertiesResource(resourceId);
        request.resource.postResourceByRoomOfService(resourceJSON, serviceId, room_ID, function(err, res){
            resourceList = res.body.resources;
            totalResources = res.body.resources.length;
            (resourceList instanceof Array)?  null : resourceList = [];
            var found = helper.compareResourceByResourceId(resourceList,resourceId);
            roomResourceId = found[0]._id;
            expect(found.shift().resourceId).to.equal(resourceId.toString());
            done();
        });

    });

    it('GET /services/{:serviceId}/rooms/{:roomId}/resources returns all resources by room and service Id', function(done){
        request.resource.getResourcesByRoomOfService(serviceId,room_ID, function(err, res){
            expect(totalResources).to.equal(res.body.length);
            var amountPresents = helper.compareResources(res.body,resourceList);
            expect(totalResources).to.equal(amountPresents);
            done();
        });
    });

    it('GET /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId} returns a specific resource by room and service Id', function(done){
      request.resource.getResourceByRoomOfService(serviceId, room_ID, roomResourceId, function(err, res){
            expect(resourceBody.resourceId == res.body.resourceId).to.equal(true);
            expect(resourceBody.quantity == res.body.quantity).to.equal(true);
            done();
        });
    });

    it('PUT /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId} updates a specific resource from a specific room', function(done){
        var quantity = generator.generateCapacity();
        var bodyJSON = {"quantity": quantity};
        request.resource.putResourceByRoomOfService(serviceId, room_ID, roomResourceId, bodyJSON, function(err, res){
            var found = helper.compareResourceById(res.body.resources,roomResourceId);
            expect(found.shift().quantity).to.equal(parseInt(quantity));
            done();
        });
    });

    it('DEL /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId} removes a specific resource from a specific room', function(done){
        request.resource.delResourceByRoomOfService(serviceId, room_ID, roomResourceId, function(err, res){
            var found = helper.compareResourceById(res.body.resources,roomResourceId);
            expect(found).to.empty;
            done();
        });
    });

    after(function (done) {
        if (resourceId !== undefined) {
            dbQuery.removeResource(resourceId, function () {
                done();
            });
        }
    });
});