const expect = require('chai').expect,
  conf = require('./conf'),
  WhmcsError = require('../lib/whmcserror');

describe('Module "Support"', function () {

  it('should add an announcement', async function () {
    let opts = {
      date: '1969-07-11',
      title: 'There\'s something wrong',
      announcement: 'Your circuit\'s dead'
    };

    let res = await conf.whmcs.support.addAnnouncement(opts);
    expect(res).to.have.a.property('result').to.equal('success');
    expect(res).to.have.a.property('announcementid').to.not.be.null;
  });

  it('should add a cancel request', async function () {
    let opts = {
      serviceid: conf.demoServiceId
    };
    let res = await conf.whmcs.support.addCancelRequest(opts);
    expect(res).to.have.a.property('result').to.equal('success');
  });

  it('should add a client note', async function () {
    let opts = {
      userid: conf.demoClientId,
      notes: 'Planet Earth is blue and there\'s nothing I can do'
    };

    let res = await conf.whmcs.support.addClientNote(opts);
    expect(res).to.have.a.property('result').to.equal('success');
  });

  it('should open a ticket', async function () {
    let opts = {
      deptid: conf.demoDeptId,
      clientid: conf.demoClientId,
      subject: 'this is a subject',
      message: 'this is a message'
    };

    let res = await conf.whmcs.support.openTicket(opts);
    expect(res).to.have.a.property('result').to.equal('success');
    expect(res).to.have.a.property('id').to.not.be.null;
    expect(res).to.have.a.property('tid').to.not.be.null;
    expect(res).to.have.a.property('c').to.not.be.null;
  });

  describe('Announcement', function () {
    let demoAnnouncementId;

    before(async function () {
      let opts = {
        date: '1969-07-11',
        title: 'There\'s something wrong',
        announcement: 'Your circuit\'s dead'
      };

      let res = await conf.whmcs.support.addAnnouncement(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('announcementid').to.not.be.null;
      demoAnnouncementId = res.announcementid;
    });

    it('should get announcements', async function () {
      let opts = {
        limitstart: 0,
        limitnum: 1
      };

      let res = await conf.whmcs.support.getAnnouncements(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('announcements').to.be.an.an('object');
      expect(res.announcements).to.have.a.property('announcement').to.be.an('array').to.have.length.above(0);
    });

    it('should delete an announcement', async function () {
      let deleteOpts = {
        announcementid: demoAnnouncementId
      };
      let deleteRes = await conf.whmcs.support.deleteAnnouncement(deleteOpts);
      expect(deleteRes).to.have.a.property('result').to.equal('success');
    });

  });

  describe('Ticket', function () {
    let demoTicketId;

    before(async function () {
      let opts = {
        deptid: conf.demoDeptId,
        clientid: conf.demoClientId,
        subject: 'this is a subject',
        message: 'this is a message'
      };

      let res = await conf.whmcs.support.openTicket(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('id').to.not.be.null;
      expect(res).to.have.a.property('tid').to.not.be.null;
      expect(res).to.have.a.property('c').to.not.be.null;
      demoTicketId = res.id;
    });

    it('should add a note to the ticket', async function () {
      let addOpts = {
        message: 'this is a ticket note',
        ticketid: demoTicketId
      };

      let addRes = await conf.whmcs.support.addTicketNote(addOpts);
      expect(addRes).to.have.a.property('result').to.equal('success');
    });

    it('should add a reply to the ticket', async function () {
      let opts = {
        ticketid: demoTicketId,
        clientid: conf.demoClientId,
        message: 'this is a new reply'
      };

      let res = await conf.whmcs.support.addTicketReply(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    });

    it('should update a ticket', async function () {
      let opts = {
        ticketid: demoTicketId,
        subject: 'this is an updated ticket'
      };

      let res = await conf.whmcs.support.updateTicket(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('ticketid').to.equal(demoTicketId);
    });

    it('should create another ticket and merge it', async function () {
      let openOpts = {
        deptid: 1,
        clientid: conf.demoClientId,
        subject: 'this is another subject',
        message: 'this is another message'
      };

      let openRes = await conf.whmcs.support.openTicket(openOpts);
      expect(openRes).to.have.a.property('result').to.equal('success');
      expect(openRes).to.have.a.property('id').to.not.be.null;
      expect(openRes).to.have.a.property('tid').to.not.be.null;
      expect(openRes).to.have.a.property('c').to.not.be.null;

      let mergeOpts = {
        ticketid: demoTicketId,
        mergeticketids: openRes.id,
        newsubject: 'this is a merged ticket'
      };

      let mergeRes = await conf.whmcs.support.mergeTicket(mergeOpts);
      expect(mergeRes).to.have.a.property('result').to.equal('success');
      expect(mergeRes).to.have.a.property('ticketid').to.equal(demoTicketId);
    });

    it('should block a ticket sender', async function () {
      let opts = {
        ticketid: demoTicketId
      };

      try {
        let res = await conf.whmcs.support.blockTicketSender(opts);
        expect(res).to.have.a.property('result').to.equal('success');
      } catch (e) {
        if (e instanceof WhmcsError) {
          let possibleErr = ['A Client Cannot Be Blocked'];
          expect(possibleErr.some(err => {
            return e.message.indexOf(err) > -1;
          })).to.be.true;
        } else {
          throw e;
        }
      }
    });

    describe('Ticket reply', function () {
      let demoReplyId;

      before(async function () {
        let replyOpts = {
          ticketid: demoTicketId,
          clientid: conf.demoClientId,
          message: 'this is a new reply'
        };

        let replyRes = await conf.whmcs.support.addTicketReply(replyOpts);
        expect(replyRes).to.have.a.property('result').to.equal('success');

        let getOpts = {
          ticketid: demoTicketId
        };

        let getRes = await conf.whmcs.tickets.getTicket(getOpts);
        expect(getRes).to.have.a.property('result').to.equal('success');
        expect(getRes).to.have.a.property('replies').to.be.an('object').to.have.a.property('reply').to.be.an('array').to.have.length.greaterThan(1);
        let lastReply = getRes.replies.reply[getRes.replies.reply.length - 1];
        expect(lastReply).to.have.a.property('replyid').to.not.be.null;
        demoReplyId = getRes.replies.reply[1].replyid;
      });

      it('should update a ticket reply', async function () {
        let opts = {
          replyid: demoReplyId,
          message: 'this is an updated reply'
        };
        let res = await conf.whmcs.support.updateTicketReply(opts);
        expect(res).to.have.a.property('result').to.equal('success');
      });

      it('should delete a ticket reply', async function () {
        let opts = {
          ticketid: demoTicketId,
          replyid: demoReplyId
        };
        let res = await conf.whmcs.support.deleteTicketReply(opts);
        expect(res).to.have.a.property('result').to.equal('success');
      });
    });

    describe('Ticket Note', function () {
      let demoTicketNoteId;

      before(async function () {
        let addOpts = {
          message: 'this is a ticket note',
          ticketid: demoTicketId
        };

        let addRes = await conf.whmcs.support.addTicketNote(addOpts);
        expect(addRes).to.have.a.property('result').to.equal('success');

        let ticketOpts = {
          ticketid: demoTicketId
        };

        let ticketRes = await conf.whmcs.tickets.getTicket(ticketOpts);
        expect(ticketRes).to.have.a.property('result').to.equal('success');
        expect(ticketRes).to.have.a.property('notes').to.be.an('object').to.have.a.property('note').to.be.an('array').to.have.length.greaterThan(0);
        expect(ticketRes.notes.note[0]).to.have.a.property('noteid');

        demoTicketNoteId = ticketRes.notes.note[0].noteid;
      });

      it('should delete a ticket note', async function () {
        let deleteOpts = {
          noteid: demoTicketNoteId
        };

        let deleteRes = await conf.whmcs.support.deleteTicketNote(deleteOpts);
        expect(deleteRes).to.have.a.property('result').to.equal('success');
      });

    });

    describe('Ticket removal', function () {
      it('should delete a ticket', async function () {
        let opts = {
          ticketid: demoTicketId
        };
        let res = await conf.whmcs.support.deleteTicket(opts);
        expect(res).to.have.a.property('result').to.equal('success');
      });
    });
  });

});