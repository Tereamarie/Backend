const router = require('express').Router();

const Potluck = require('./potluck-model');
const UserPotlucks = require('./user_potlucks_model');

router.get('/', (req, res) => {
  Potluck.find()
    .then(potlucks => {
      console.log(potlucks);
      res.status(200).send(potlucks);
    })  
    .catch(error => {
      console.log(error);
      console.log({message: 'There was an error in getting data from the database.'});
    })
});

router.get('/:id', (req, res) => {
  const user_id = req.user.id;
  const potluck_id = req.params.id;

  UserPotlucks.findAllAttendees(potluck_id)
    .then(potluckDetails => {
      res.status(200).send(potluckDetails);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({message: 'There was an error in getting data from the database.'});
    })
});

router.post('/', validatePotluckData, (req, res) => {
  const potluckData = req.body;
  console.log(req.user);
  const user_id = req.user.id;

  Potluck.add({...potluckData, user_id})
    .then(potluck => {
      console.log(potluck);
      res.status(201).send(potluck);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({message: 'The potluck could not be created.'});
    })

});

router.put('/:id', validateUser, (req, res) => {
  const potluck_id = req.params.id;
  const changes = req.body;

  Potluck.update(changes, potluck_id)
    .then(potluck => {
      console.log(potluck);
      res.status(200).send(potluck);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({message: 'The potluck could not be updated'});
    })
});

router.delete('/:id', validateUser, (req, res) => {
  const potluck_id = req.params.id;

  Potluck.remove(potluck_id)
    .then(count => {
      console.log(count);
      res.status(200).send({message: 'The potluck was deleted.'});
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({message: 'The potluck could not be deleted'});
    })
  
});



router.post('/:id/users', (req, res) => {
  const user_id = req.body.user_id;
  const potluck_id = req.params.id;

  UserPotlucks.getCount()
    .then(count => {
      // console.log(count);
      const id = (Object.values(count)[0]) + 1;
      // console.log(id);
      UserPotlucks.add({user_id, potluck_id, id})
        .then(response => {
          console.log(response);
          res.status(201).send(response);
        })
        .catch(error => {
          console.log(error);
          res.status(500).send({message: 'The record could not be created.'});
        })
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({messge: 'The request could not be created.Please try again later.'});
    })
});

router.put('/:id/users/:request_id', (req, res) => {
  const request_id = req.params.request_id;
  
  // const changes = req.body;

  UserPotlucks.findById(request_id) 
    .then(userPotluck => {
      // console.log(userPotluck);
      if(userPotluck) {
        UserPotlucks.update(request_id)
          .then(count => {
            res.status(200).send({message: 'The invite to atttend was accepted.'});
          })
          .catch(err => {
            console.log(err);
            res.status(500).send({message: 'The request could not be accepted.'});
          })
      } else {
        res.status(400).send({message: 'The request with provided id does not exist.'});
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({message: 'The request could not be updated.'});
    })
});

router.delete('/:id/users/:request_id', (req, res) => {
  const request_id = req.params.request_id;

  UserPotlucks.findById(request_id) 
    .then(userPotluck => {
      console.log(userPotluck);
      if (userPotluck) {
        UserPotlucks.remove(request_id)
          .then(count => {
            res.status(200).send({message: 'The request was deleted'});
          })
          .catch(err => {
            console.log(err);
            res.status(500).send({message: 'The request could not be deleted.'});
          })
      } else {
        res.status(400).send({message: 'The request with provided id does not exist.'});
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({message: 'The request could not be deleted.'});
    })
});

function validatePotluckData(req, res, next) {
  const potluckData = req.body;

  if(!potluckData.name || !potluckData.location || !potluckData.time || !potluckData.date) {
    res.status(400).send({message: 'Potluck name, location, date and time are required.'});
  } else {
    next();
  }
}

function validateUser(req, res, next) {
  const user_id = req.user.id;
  const potluck_id = req.params.id;
  
  Potluck.findById(potluck_id)
    .first()
    .then(potluck => {
      console.log(potluck);
      if(potluck) {
        if(potluck.user_id === user_id) {
          next();
        } else {
          res.status(403).send({message: 'You are not authorized to update/delete the potluck.'});
        }
      } else {
        res.status(400).send({error: 'Potluck with provided id does not exist.'});
      }  
    })  
    .catch(error => {
      console.log(error);
      res.status(500).send({message: 'There was an error. Please try again later.'});
    })
};

module.exports = router;