var expect = require('chai').expect;
var request = require('../../lib/RequestManager/manager.js');
var generator = require('../../utils/generator.js');
var dbQuery = require('../../lib/Conditions/dbQuery.js');
var config = require('../../config/config.json');

describe("Smoke: Room Resources - Feature", function(){
    this.slow(config.timeSlow);
    this.timeout(config.timeOut);
    var roomId;
    var resource_ID;
    var serviceId;
    var roomResourceId;
    var resourceBody;

    before(function(done){
        request.authentication.postLogin(function(err, res){
            var resourceBody = generator.generator_resource.generateResource();
            request.resource.postResource(resourceBody, function(err, res){
                resource_ID = res.body._id;
                generator.generator_resource.setPropertiesResource(resource_ID);
                dbQuery.preCondition.getRandomRoom(function(res){
                    roomId = res._id;
                    dbQuery.preCondition.findAllServices(function(res){
                        serviceId = res[0]._id;
                        done();
                    });
                });
            });
        });
    });
    beforeEach(function(done){
        generator.generator_resource.setPropertiesResource(resource_ID);
        resourceBody = generator.generator_resource.getResources();
        request.room.postRoomResource(roomId, resourceBody, function(err, res){
            roomResourceId = res.body[0]._id;
            done();
        });
    });
    afterEach(function (done) {
        if (roomResourceId !== undefined) {
            dbQuery.removeResource(roomResourceId, function () {
                done();
            });
        }
    });
    it('GET /rooms/{:roomId}/resources/{:roomResourceId}, returns status code 200', function(done){
        request.resource.getResourceByRoomId(roomId, roomResourceId, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('GET /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId}, returns status code 200', function(done){
        request.resource.getResourceByRoomOfService(serviceId, roomId, roomResourceId, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

   it('PUT /rooms/{:roomId}/resources/{:roomResourceId}, returns status code 200', function(done){
        var body = {"quantity": generator.generateCapacity()};
        request.resource.putResourceByRoom(roomId, roomResourceId, body, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('PUT /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId}, returns status code 200', function(done){
        var body = {"quantity": generator.generateCapacity()};
        request.resource.putResourceByRoomOfService(serviceId, roomId, roomResourceId, body, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('DEL /rooms/{:roomId}/resources/{:roomResourceId}, returns status code 200', function(done){
        request.resource.delResourceByRoom(roomId, roomResourceId, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('DEL /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId}, returns status code 200', function(done){
        request.resource.delResourceByRoomOfService(serviceId, roomId, roomResourceId, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });
});
