var expect = require('chai').expect;
var request = require('../../lib/RequestManager/manager.js');
var generator = require('../../utils/generator.js');
var dbQuery = require('../../lib/Conditions/dbQuery.js');
var config = require('../../config/config.json');

describe("Smoke: Rooms - Feature", function(){

    this.slow(config.timeSlow);
    this.timeout(config.timeOut);
    var roomId;
    var serviceId;

    before(function(done){
        request.authentication.postLogin(function(err, res){
            dbQuery.preCondition.getRandomRoom(function(res){
                    roomId = res._id;
                    request.authentication.postLogin(function(err, res){
                        dbQuery.preCondition.findAllServices(function(res){
                            serviceId = res[0]._id;
                            done();
                        });
                    });
            });
        });
    });

    it('GET /rooms, returns status code 200', function(done){
        request.room.getRoom(function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
     });

    it('GET /rooms/{:roomId}, returns 404 status code when non-existent roomId is used', function(done){
        var nonExistentRoomId = generator.generateValues();
        request.room.getRoomById(nonExistentRoomId, function(err, res){
            expect(res.status).to.equal(config.statusCode.NOT_FOUND);
            done();
        });
    });

    it('GET /rooms/{:roomId}, returns status code 200', function(done){
        request.room.getRoomById(roomId, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('GET /services/{:serviceId}/rooms, returns status code 200', function(done){
        request.room.getRoomsByService(serviceId, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('GET /services/{:serviceId}/rooms/{:roomId}, returns status code 200', function(done){
        request.room.getRoomByService(serviceId, roomId, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('PUT /rooms/{:roomId}, returns status code 200', function(done){
        var body = generator.generator_room.generateRoom();
        request.room.putRoom(roomId, body, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });

    it('PUT /rooms/{:roomId}, returns 404 status code when non-existent roomId is used', function(done){
        var body = generator.generator_room.generateRoom();
        var nonExistentRoomId = generator.generateValues();
        request.room.putRoom(nonExistentRoomId, body, function(err, res){
            expect(res.status).to.equal(config.statusCode.NOT_FOUND);
            done();
        });
    });

    it('PUT /rooms/{:roomId}, returns status code 401 when an incorrect authorization is used', function(done){
        var body = generator.generator_room.generateRoom();
        request.room.putRoomIncorrectAuthorization(roomId, body, function(err, res){
            expect(res.status).to.equal(config.statusCode.UNAUTHORIZED);
            done();
        });
    });

    it('PUT /services/{:serviceId}/rooms/{:roomId}, returns status code 200', function(done){
        var body = generator.generator_room.generateRoom();
        request.room.putRoomByService(serviceId, roomId, body, function(err, res){
            expect(res.status).to.equal(config.statusCode.OK);
            done();
        });
    });


});
