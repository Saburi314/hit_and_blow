const nextAction = ['play', 'exit'] as const
type NextAction = typeof nextAction[number]

class GameProcedure {
    private currentGameTitle = 'hit and blow'
    private currentGame = new HitAndBlow()

    public async start() {
        await this.play()
    }

    private async play() {
        printline(`${this.currentGameTitle}`)
        await this.currentGame.setting()
        await this.currentGame.play()
        this.currentGame.end()

        const action = await promptSelect('ゲームを続けますか？', nextAction)
        if (action === 'play') {
            this.play()
        } else if (action === 'exit') {
            this.end()
        } else {
            const neverValue: never = action
            throw new Error(`${neverValue}は不正な値です。`)
        }
    }

    private end() {
        printline(`ゲームを終了します。`)
        process.exit()
    }
}


const printline = (text: string, breakLine: boolean = true) => {
    process.stdout.write(text + (breakLine ? '\n' : ''));
}

const promptInput = async (text: string) => {
    printline(`\n${text}\n>` , false)

    return readline()
}

const readline = async () => {
    const input: string = await new Promise((resolve) =>
        process.stdin.once('data', (data) => 
            resolve(data.toString().trim())))
    return input.trim()
}

const promptSelect = async <T extends string>(text: string, values: readonly T[]): Promise<T> => {
    printline(`\n${text}`)
    values.forEach((value) => {
        printline(`${value}`)
    })
    printline('>', false)

    const input = (await readline()) as T
    if (values.includes(input)) {
        return input
    } else {
        return promptSelect<T>(text, values)
    }
}

const modes = ['normal', 'hard'] as const
type Mode = typeof modes[number]

class HitAndBlow {
    private readonly answerSource: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    private answer: string[] = []
    private tryCount: number = 0
    private mode: Mode = 'normal'

    private getAnswerLength() {
        switch (this.mode) {
            case 'normal':
                return 3
            case 'hard':
                return 4
            default:
                throw new Error('Invalid mode');
        }
    }

    private validate(inputArr: string[]) {
        const isLengthValid = inputArr.length === this.answer.length
        const isAllAnswerSourceOption = inputArr.every((val) => this.answerSource.includes(val))
        const isAllDifferentValues = inputArr.every((val, i) => inputArr.indexOf(val) === i)
        return isLengthValid && isAllAnswerSourceOption && isAllDifferentValues
    }
    
    async setting() {
        this.mode = await promptSelect('モードを選択してください', modes)
        const answerLength = this.getAnswerLength()

        while (this.answer.length < answerLength) {
            const randomNum = Math.floor(Math.random() * this.answerSource.length)
            const selectedItem = this.answerSource[randomNum]

            if (!this.answer.includes(selectedItem)) {
                this.answer.push(selectedItem)
            }
        }
    }

    async play() {
        const answerLength = this.getAnswerLength()
        const inpurArr = (await promptInput(', 区切りで' + answerLength + 'つの数字を入力してください')).split(',')
        
        if (!this.validate(inpurArr)) {
            printline('入力が正しくありません。')
            await this.play()
            return
        }
        
        const result = this.check(inpurArr)

        if (result.hitCount !== this.answer.length) {
            printline(`\nヒット数: ${result.hitCount} ブロー数: ${result.blowCount}`)
            this.tryCount++
            await this.play()
        } else {
            this.tryCount++
        }
    }

    private check(inputArr: string[]) {
        let hitCount = 0
        let blowCount = 0

        inputArr.forEach((val, index) => {
            if (val === this.answer[index]) {
                hitCount++
            } else if (this.answer.includes(val)) {
                blowCount++
            }
        })

        return {hitCount, blowCount}    
    }

    end() {
        printline(`正解です！ \n${this.tryCount}回でクリアしました！`)
        this.reset()
    }

    private reset() {
        this.answer = []
        this.tryCount = 0
    }
}



;(async () => {
    new GameProcedure().start()
})()
