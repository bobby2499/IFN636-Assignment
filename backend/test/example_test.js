const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Attraction = require('../models/Attraction');
const Review = require('../models/Review');
const { createAttraction, getAttractions, getAttraction, updateAttraction, deleteAttraction } = require('../controllers/attractionController');
const { expect } = chai;

// ============================================================
// CREATE - AddAttraction Function Tests
// ============================================================
describe('CreateAttraction Function Test', () => {

    it('should create a new attraction successfully', async () => {
        // Mock request data
        const req = {
            user: { id: new mongoose.Types.ObjectId() },
            body: {
                name: 'Great Barrier Reef',
                description: 'The worlds largest coral reef system',
                location: 'Queensland, Australia',
                category: 'Nature',
                openingHours: '6:00 AM - 6:00 PM',
                entryPrice: 85
            }
        };

        // Mock attraction that would be created
        const createdAttraction = { _id: new mongoose.Types.ObjectId(), ...req.body, createdBy: req.user.id };

        // Stub Attraction.create to return the created attraction
        const createStub = sinon.stub(Attraction, 'create').resolves(createdAttraction);

        // Mock response object
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        // Call function
        await createAttraction(req, res);

        // Assertions
        expect(createStub.calledOnce).to.be.true;
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(createdAttraction)).to.be.true;

        // Restore stubbed methods
        createStub.restore();
    });

    it('should return 500 if an error occurs', async () => {
        // Stub Attraction.create to throw an error
        const createStub = sinon.stub(Attraction, 'create').throws(new Error('DB Error'));

        // Mock request data
        const req = {
            user: { id: new mongoose.Types.ObjectId() },
            body: { name: 'Test', description: 'Test', location: 'Test', category: 'Nature' }
        };

        // Mock response object
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        // Call function
        await createAttraction(req, res);

        // Assertions
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        // Restore stubbed methods
        createStub.restore();
    });
});

// ============================================================
// READ - GetAttractions Function Tests
// ============================================================
describe('GetAttractions Function Test', () => {

    it('should return all attractions for the user', async () => {
        // Mock attractions data
        const mockAttractions = [
            { _id: new mongoose.Types.ObjectId(), name: 'Great Barrier Reef', location: 'Queensland' },
            { _id: new mongoose.Types.ObjectId(), name: 'Sydney Opera House', location: 'Sydney' }
        ];

        // Stub Attraction.find to return mock data
        const findStub = sinon.stub(Attraction, 'find').resolves(mockAttractions);

        // Mock request and response
        const req = {};
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        // Call function
        await getAttractions(req, res);

        // Assertions
        expect(findStub.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith(mockAttractions)).to.be.true;

        // Restore
        findStub.restore();
    });

    it('should return 500 on error', async () => {
        const findStub = sinon.stub(Attraction, 'find').throws(new Error('DB Error'));

        const req = {};
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await getAttractions(req, res);

        expect(res.status.calledWith(500)).to.be.true;

        findStub.restore();
    });
});

// ============================================================
// UPDATE - UpdateAttraction Function Tests
// ============================================================
describe('UpdateAttraction Function Test', () => {

    it('should update an attraction successfully', async () => {
        const attractionId = new mongoose.Types.ObjectId();

        const req = {
            params: { id: attractionId },
            body: { name: 'Updated Reef', description: 'Updated description' }
        };

        const updatedAttraction = { _id: attractionId, ...req.body, location: 'Queensland', category: 'Nature' };

        // Stub findByIdAndUpdate
        const updateStub = sinon.stub(Attraction, 'findByIdAndUpdate').resolves(updatedAttraction);

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await updateAttraction(req, res);

        expect(updateStub.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith(updatedAttraction)).to.be.true;

        updateStub.restore();
    });

    it('should return 404 if attraction is not found', async () => {
        const updateStub = sinon.stub(Attraction, 'findByIdAndUpdate').resolves(null);

        const req = {
            params: { id: new mongoose.Types.ObjectId() },
            body: { name: 'Does Not Exist' }
        };

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await updateAttraction(req, res);

        expect(res.status.calledWith(404)).to.be.true;

        updateStub.restore();
    });

    it('should return 500 on error', async () => {
        const updateStub = sinon.stub(Attraction, 'findByIdAndUpdate').throws(new Error('DB Error'));

        const req = {
            params: { id: new mongoose.Types.ObjectId() },
            body: { name: 'Error Test' }
        };

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await updateAttraction(req, res);

        expect(res.status.calledWith(500)).to.be.true;

        updateStub.restore();
    });
});

// ============================================================
// DELETE - DeleteAttraction Function Tests
// ============================================================
describe('DeleteAttraction Function Test', () => {

    it('should delete an attraction successfully', async () => {
        const attractionId = new mongoose.Types.ObjectId();
        const mockAttraction = { _id: attractionId, name: 'Test Attraction' };

        const deleteStub = sinon.stub(Attraction, 'findByIdAndDelete').resolves(mockAttraction);
        const deleteReviewsStub = sinon.stub(Review, 'deleteMany').resolves({ deletedCount: 2 });

        const req = { params: { id: attractionId } };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await deleteAttraction(req, res);

        expect(deleteStub.calledOnce).to.be.true;
        expect(deleteReviewsStub.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;

        deleteStub.restore();
        deleteReviewsStub.restore();
    });

    it('should return 404 if attraction is not found', async () => {
        const deleteStub = sinon.stub(Attraction, 'findByIdAndDelete').resolves(null);

        const req = { params: { id: new mongoose.Types.ObjectId() } };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await deleteAttraction(req, res);

        expect(res.status.calledWith(404)).to.be.true;

        deleteStub.restore();
    });

    it('should return 500 if an error occurs', async () => {
        const deleteStub = sinon.stub(Attraction, 'findByIdAndDelete').throws(new Error('DB Error'));

        const req = { params: { id: new mongoose.Types.ObjectId() } };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await deleteAttraction(req, res);

        expect(res.status.calledWith(500)).to.be.true;

        deleteStub.restore();
    });
});
