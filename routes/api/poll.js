const express = require('express')
const router = express.Router()
const knex = require('../../db')

router.get('/:id', (req, res) => {
    if(req.params.id) {
        knex('polls').where('id', req.params.id).then(result => {
            console.log(result)
            res.send('ok')
        })
    } else {
        res.json({
            success: false,
            message: 'Id not supplied'
        })
    }
})

router.post('/create', (req, res) => {
    if (!req.body.question) {
        res.json({
            success: false,
            message: 'Poll requires a question'
        })
    } else if (!req.body.answers || req.body.answers.length < 2) {
        res.json({
            success: false,
            message: 'Poll requires at least 2 answers'
        })
    } else {
        knex('polls').insert({
            question: req.body.question
        }).then(pollId => {
            pollId = pollId[0]
            const options = req.body.answers.map(p => {
                return {
                    poll_id: pollId,
                    option: p
                }
            })
            return [knex('poll_options').insert(options), pollId]
        }).spread((result, id) => {
            res.json({ success: true, id: id })
        }).catch(err => {
            res.json({
                success: false,
                message: err
            })
        })
    }
})

module.exports = router