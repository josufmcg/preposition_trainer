(function(global, $){

    /** 
     * Models
    */
    class Config {
        constructor(data) {
            this.dataFolder = data['data_folder'];
        }
    }

    class Group {
        constructor(data) {
            this.id = data['id'];
            this.name = data['name'];
            this.questionLang = data['question_lang'];
            this.responseLang = data['response_lang'];
        }
    }

    class Question {
        constructor(data) {
            this.group_id = data['group_id'];
            this.question = data['question'];
            this.answer = data['answer'];
            this.randomize = {};
            if ('randomize' in data) {
                this.randomize = data['randomize'];
            }
        }
        getQuestion() {
            var self = this;
            if(!self.randomize) {
                return self.question;
            }
            let question = self.question;
            Object.keys(self.randomize).forEach((key) =>{
                let index = self.randomize[key]['index'];
                question = question.replace(`##${key}##`, self.randomize[key]['question'][index])
            });
            return question;
        }
        getAnswer() {
            var self = this;
            if(!self.randomize){
                return self.answer;
            } 
            let answer = self.answer;
            Object.keys(self.randomize).forEach((key) =>{
                let index = self.randomize[key]['index'];
                answer = answer.replace(`##${key}##`, self.randomize[key]['answer'][index])
            });
            return answer;
        }
    }


    /** 
     * Repositories
    */
    var ConfigRepository = {
        getConfig: async function(){
            var opts = {
                method: 'GET',
                headers: {}
            };
            const response = await fetch('./config/config.json', opts);
            return response.json();
        }
    };
    
    var GroupRepository = {
        dataFolder: 'data',

        init: function(config){
            self.dataFolder = config.dataFolder
        },

        getGroups: async function(){
            var opts = {
                method: 'GET',
                headers: {}
            };
            const response = await fetch(self.dataFolder + '/groups.json', opts);
            return response.json();
        }
    };
    

    var QuestionRepository = {
        dataFolder: 'data',

        init: function(config){
            self.dataFolder = config.dataFolder
        },
        
        getQuestions: async function(){
            var opts = {
                method: 'GET',
                headers: {}
            };
            const response = await fetch(self.dataFolder + '/questions.json', opts);
            return response.json();
        }
    };


    /** 
     * Utils
    */
    var Utils = {
        getRandomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        },

        synthText: function (lang, message){
            if(speechSynthesis.speaking){
                speechSynthesis.cancel();
            }
            var msg = new SpeechSynthesisUtterance();
            msg.text = message;
            msg.lang = lang;
            speechSynthesis.speak(msg);
        }
    }


    /** 
     * ViewModel
    */
    var ViewModel = {
        config : {},
        groups : [],
        questions : [],
        currentGroup: {},
        currentQuestions : [],
        currentQuestion : {},
        autoPlay: false,

        init: async function(){
            var self = this;

            await self.loadDataCache();
            self.setDefaultParams();
            self.loadViews();
            self.loadViewEvents();
        },


        loadDataCache: async function(){
            var self = this;

           await ConfigRepository.getConfig().then(function(configData){
                self.config = new Config(configData);
            });

            GroupRepository.init(self.config);
            await GroupRepository.getGroups().then(function(groupsData){
                for (let i=0; i<groupsData.length; i++){
                    let group = new Group(groupsData[i]);
                    self.groups.push(group)
                }
            });
            
            QuestionRepository.init(self.config);
            await QuestionRepository.getQuestions().then(function(questionsData){
                for (let i=0; i<questionsData.length; i++){
                    let question = new Question(questionsData[i]);
                    self.questions.push(question)
                }
            });
        },

        setDefaultParams: function(){
            var self = this;
            self.currentGroup = self.groups[0];
            self.updateGroupQuestions();
        },

        updateGroupQuestions: function(){
            var self = this;
            self.currentQuestions = self.questions.filter((question) =>{
                return question.group_id == self.currentGroup.id;
            })
        },

        loadViews: function(){
            var self = this;
            $('select#category').empty();
            for(let i=0; i< self.groups.length; i++){
                let group = self.groups[i];
                sel = group.id == self.currentGroup.id ? 'selected' : '';
                $('select#category').append('<option value="' + group.id + '" ' + sel + '>' + group.name + '</option>');
            } 
        },


        loadViewEvents: function(){
            var self = this;

            $('select#category').on('change', function() {
                var value = this.value;
                let groups = self.groups.filter((group) =>{
                    return group.id == value;
                });
                if (!groups) return;

                self.currentGroup = groups[0];
                self.updateGroupQuestions()
            });
            
            $('button#next').click(function(event){
                event.preventDefault();
                self.showRandomQuestion();
            });

            $('button#answer').click(function(event){
                event.preventDefault();
                self.showQuestionResponse();
               
            })

            $('input#autoplay').on('change', function(){
                self.autoPlay = this.checked;
                if (self.autoPlay) {
                    self.startAutoplay();
                    $('div#controls-panel').hide();
                } else {
                    $('div#controls-panel').show();
                }
            });
        },

        showRandomQuestion: function(){
            var self = this;

            let questionIndex = Utils.getRandomInt(0, self.currentQuestions.length);
            self.currentQuestion = self.currentQuestions[questionIndex];
            if(self.currentQuestion.randomize){
                let keys = Object.keys(self.currentQuestion.randomize);
                keys.forEach(key => {
                    let len = self.currentQuestion.randomize[key]['question'].length;
                    let index = Utils.getRandomInt(0, len);
                    self.currentQuestion.randomize[key]['index'] = index
                });
            }
            $('#question_sentence').val(self.currentQuestion.getQuestion());
            $('#response_sentence').val('-');
            $('button#answer').show();
            Utils.synthText(self.currentGroup.questionLang, self.currentQuestion.getQuestion());
        },

        showQuestionResponse: function(){
            var self = this;

            $('#response_sentence').val(self.currentQuestion.getAnswer());
            $('button#answer').hide();
            Utils.synthText(self.currentGroup.responseLang, self.currentQuestion.getAnswer());
        },

        startAutoplay: async function(){
            var self = this;

            while(self.autoPlay) {
                await new Promise(r => setTimeout(r, 3000));
                let groupIndex = Utils.getRandomInt(0, self.groups.length);
                self.currentGroup = self.groups[groupIndex];
                self.updateGroupQuestions();
                self.showRandomQuestion();
                await new Promise(r => setTimeout(r, 5000));
                self.showQuestionResponse();
            }
        },

        later: function (delay) {
            return new Promise(function(resolve) {
                setTimeout(resolve, delay);
            });
        }
    }


    ViewModel.init();
    
}(window, jQuery));


