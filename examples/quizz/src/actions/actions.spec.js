import actionCreators  from './action';


describe('Quizz Actions', () => {
    it('startQuizz should create START_QUIZZ action', () => {
        expect(actionCreators.startQuizz('START_QUIZZ')).toEqual({
            type: 'START_QUIZZ',
        })
    })

    it('restartQuizz should create RESTART_QUIZZ action', () => {
        expect(actionCreators.restartQuizz('RESTART_QUIZZ')).toEqual({
            type: 'RESTART_QUIZZ',
        })
    })

    it('incrementScore should create INCREMENT_SCORE action', () => {
        expect(actionCreators.incrementScore('INCREMENT_SCORE')).toEqual({
            type: 'INCREMENT_SCORE',
        })
    })

    it('finishQuizz should create FINISH_QUIZZ action', () => {
        expect(actionCreators.finishQuizz('FINISH_QUIZZ')).toEqual({
            type: 'FINISH_QUIZZ',
        })
    })

    it('continueQuizz should create CONTINUE_QUIZZ action', () => {
        expect(actionCreators.continueQuizz('CONTINUE_QUIZZ')).toEqual({
            type: 'CONTINUE_QUIZZ',
        })
    })
})