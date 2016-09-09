var expect = require('chai').expect;
var request = require('../../lib/RequestManager/manager.js');
var generator = require('../../utils/generator.js');
var dbQuery = require('../../lib/Conditions/dbQuery.js');
var config = require('../../config/config.json');
var helper = require('../../utils/helper.js');

describe("CRUD - Room Resources Service", function(){

    this.slow(config.timeSlow);
    this.timeout(config.timeOut);
    var serviceId, room_ID, room_ID2;
    var roomResourceId, totalResources, resourceId;
    var resourceBody;
    var resourceList;
    var resourceJSON;

    before(function(done){
        request.authentication.postLogin(function(err, res){
            dbQuery.preCondition.findAllServices(function(res){
                serviceId = res[0]._id;
                dbQuery.preCondition.findAllRoomsOfOneService(serviceId, function(res){
                    room_ID = res[0]._id;
                    room_ID2 = res[1]._id;
                    done();
                });
            });
        });
    });

    beforeEach(function(done){
        resourceBody = generator.generator_resource.generateResource();
        dbQuery.preCondition.insertResource(resourceBody,function(res){
            roomResourceId = res._id;
            generator.generator_resource.setPropertiesResource(roomResourceId);
            dbQuery.preCondition.addResourceToRoom(room_ID,resourceBody,function(err, res){
                dbQuery.preCondition.findRoom(room_ID,function(res){
                    totalResources = res.resources.length;
                    resourceList = res.resources;
                    done();
                });
            });
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
            resourceId =resourceBody._id;
            expect(resourceBody.resourceId.toString()).to.equal(res.body.resourceId);
            expect(resourceBody.quantity).to.equal(res.body.quantity.toString());
            done();
        });
    });

    it('PUT /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId} updates a specific resource from a specific room', function(done){
        var quantity = generator.generateCapacity();
        var bodyJSON = {"quantity": quantity};
        request.resource.putResourceByRoomOfService(serviceId, room_ID, resourceId, bodyJSON, function(err, res){
            var found = helper.compareResourceByResourceId(res.body.resources,roomResourceId);
            expect(found.shift().quantity).to.equal(parseInt(quantity));
            done();
        });
    });

    it('DEL /rooms/{:roomId}/resources/{:roomResourceId} removes a specific resource from a specific room', function(done){
        request.resource.delResourceByRoomOfService(serviceId, room_ID, roomResourceId, function(err, res){
            var found = helper.compareResourceById(res.body.resources,roomResourceId);
            expect(found).to.empty;
            done();
        });
    });

    it('POST /rooms/{:roomId}/resources associates a resource to a room', function(done){
        var found;
        resourceJSON = generator.generator_resource.generateResource();
        generator.generator_resource.setPropertiesResource(roomResourceId);
        request.resource.postResourceByRoomOfService(resourceJSON, serviceId, room_ID2, function(err, res){
            var resourcesList = res.body.resources;
            (resourcesList instanceof Array)? found = null : resourcesList = [];
            found = helper.compareResourceByResourceId(resourcesList,roomResourceId);
            expect(found.shift().resourceId).to.equal(roomResourceId.toString());
            done();
        });

    });

    afterEach(function(done){
        if(roomResourceId) {
            dbQuery.postCondition.removeResourceToRoom(room_ID, roomResourceId, function (re) {
                dbQuery.postCondition.removeResource(roomResourceId, function (res) {
                    done();
                });
            });
        }
        else{
            done();
        }
    });
    after(function(done){
        dbQuery.postCondition.removeResourceToRoom(room_ID2, roomResourceId, function (err,res) {
            done();
        });
    });
});