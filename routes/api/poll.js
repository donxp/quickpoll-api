const express = require('express')
const router = express.Router()
const knex = require('../../db')

router.get('/:id', (req, res) => {
    if(req.params.id) {
        knex('polls').where('id', req.params.id).first().then(result => {
            return [knex('poll_options').where('poll_id', result.id), result.question]
        }).spread((result, question) => {
            const options = result.map(p => {
                return {
                    id: p.id,
                    option: p.option
                }
            })
            return {
                question,
                options
            }
        }).then(poll => {
            res.json({
                success: true,
                poll
            })
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

router.post('/vote', (req, res) => {
    if(!req.body.answer_id) {
        res.json({
            success: false,
            message: 'Answer not provided'
        })
    } else {
        knex('votes').insert({
            answer_id: req.body.answer_id
        }).then(result => {
            global.io.emit('vote', req.body.answer_id)
            res.json({
                success: true
            })
        }).catch(err => {
            res.json({
                success: false,
                message: err
            })
        })
    }
})

router.get('/votes/:id', (req, res) => {
    if(req.params.id) {
        knex.from('votes')
        .select('answer_id', 'option').select(knex.raw('COUNT(*) as count'))
        .innerJoin('poll_options', 'votes.answer_id', '=', 'poll_options.id')
        .innerJoin('polls', 'poll_options.poll_id', '=', 'polls.id')
        .where('poll_options.poll_id', req.params.id)
        .groupBy('answer_id')
        .then(result => {
            res.json({
                success: true,
                votes: result
            })
        }).catch(err => {
            res.json({
                success: false,
                message: err
            })
        })
    }
})

module.exports = router