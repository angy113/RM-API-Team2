var expect = require('chai').expect;
var request = require('../../lib/RequestManager/manager.js');
var generator = require('../../utils/generator.js');
var dbQuery = require('../../lib/Conditions/dbQuery.js');
var config = require('../../config/config.json');
var helper = require('../../utils/helper.js');

describe("CRUD: methods for API-Room", function(){

    this.slow(config.timeSlow);
    this.timeout(config.timeOut);
    var room;
    var serviceId;
    var roomsServiceListExpected;
    before(function(done){
        request.authentication.postLogin(function(err, res){
            dbQuery.preCondition.findAllServices(function(res){
                serviceId = res[0]._id;
                dbQuery.preCondition.getRandomRoom(function (res) {
                    room = res;
                    done();
                });
            });

        });
    });

    it('CRUD - GET /room returns all rooms', function(done){
        request.room.getRoom(function(err, res){
            dbQuery.preCondition.findAllRooms(function(resDb) {
                expect(res.body.length).to.equal(resDb.length);
                done();
            });
        });
    });

    it('CRUD - GET /rooms/{:roomId} returns a room', function(done){
        request.room.getRoomById(room._id, function(err, res){
            expect(res.body._id).to.equal(room._id.toString());
            expect(res.body.customDisplayName).to.equal(room.customDisplayName);
            done();
        });
    });
    
    it('CRUD - PUT /rooms/{:roomId} modifies a specific room', function(done){
        var body = generator.generator_room.generateRoom();
        room.customDisplayName=body.customDisplayName;
        request.room.putRoom(room._id, body, function(err, res){
            expect(res.body._id).to.equal(room._id.toString());
            expect(res.body.customDisplayName).to.equal(room.customDisplayName);
            done();
        });
    });

    it('CRUD - GET /services/{:serviceId}/rooms returns all rooms by service Id', function(done){
        dbQuery.preCondition.findAllRoomsOfOneService(serviceId,function(res){
            roomsServiceListExpected = res;
            request.room.getRoomsByService(serviceId, function(err, res){
                var roomServiceResult =res.body;
                var totalFound = helper.compareRoomService(roomServiceResult,roomsServiceListExpected);
                expect(totalFound).to.equal(roomsServiceListExpected.length);
                expect(roomServiceResult.length).to.equal(roomsServiceListExpected.length);
                done();
            });
        });
    });

    it('CRUD - GET /services/{:serviceId}/rooms/{:roomId} returns a room by service Id', function(done){
        dbQuery.preCondition.findAllRoomsOfOneService(serviceId,function(res){
            var roomServiceId = res[0]._id;
            var roomServiceName = res[0].customDisplayName;
            request.room.getRoomByService(serviceId, roomServiceId, function(err, res){
                expect(res.body._id).to.equal(roomServiceId.toString());
                expect(res.body.customDisplayName).to.equal(roomServiceName);
                done();
            });
        });
    });

    it('CRUD - PUT /services/{:serviceId}/rooms/{:roomId} modify a specific room by service Id', function(done){
        dbQuery.preCondition.findAllRoomsOfOneService(serviceId,function(res){
            var roomServiceId = res[0]._id;
            var body = generator.generator_room.generateRoom();
            var roomServiceName=body.customDisplayName;
            request.room.putRoomByService(serviceId, roomServiceId, body, function(err, res){
                expect(res.body._id).to.equal(roomServiceId.toString());
                expect(res.body.customDisplayName).to.equal(roomServiceName);
                done();
            });
        });
    });
});