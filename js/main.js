(function(global){
			
    // La función que devolverá el objeto
    var Config = function (data){
        this.question_sentence_lang = data['question_sentence_lang'];
        this.response_sentence_lang = data['response_sentence_lang'];
    };

    var ConfigRepository = {};
    ConfigRepository.getConfig = function(){
        var opts = {
        method: 'GET',      
        headers: {}
        };
        return fetch('/config/config.json', opts).then(function (response) {
            return response.json();
        });
    }
    
    var Group = function (data){
        this.id = data['id'];
        this.name = data['name'];
        this.order = data['order'];
    };

    var GroupRepository = {};
    GroupRepository.getGroups = function(){
        var opts = {
        method: 'GET',      
        headers: {}
        };
        return fetch('/config/groups.json', opts).then(function (response) {
            return response.json();
        });
    }

    var Question = function (data){
        this.category_id = data['category_id'];
        this.question = data['question'];
        this.answer = data['answer'];
    };

    var QuestionRepository = {};
    QuestionRepository.getQuestions = function(){
        var opts = {
        method: 'GET',      
        headers: {}
        };
        return fetch('/config/questions.json', opts).then(function (response) {
            return response.json();
        });
    }

    
    // Generamos los alias hacia la función
    global.PT = {};
    global.PT.Config = Config;
    global.PT.Group = Group;
    global.PT.Question = Question;

    global.PT.ConfigRepository = ConfigRepository;
    global.PT.GroupRepository = GroupRepository;
    global.PT.QuestionRepository = QuestionRepository;
    
}(window));


$(document).ready(function(){
    
    var config = {};
    PT.ConfigRepository.getConfig().then(function(configData){
        config = new PT.Config(configData);
        console.log(config);
    });

    var groups = [];
    PT.GroupRepository.getGroups().then(function(groupsData){
        for (let i=0; i<groupsData.length; i++){
            group = new PT.Group(groupsData[i]);
            groups.push(group)
        }
        console.log(groups);
    });

    var questions = [];
    PT.QuestionRepository.getQuestions().then(function(questionsData){
        for (let i=0; i<questionsData.length; i++){
            question = new PT.Question(questionsData[i]);
            questions.push(question)
        }
        console.log(questions);
    });

    let question = {};
    $('button#next').click(function(event){
        event.preventDefault();
        let questionIndex = getRandomInt(0, questions.length);
        question = questions[questionIndex];
        $('#question_sentence').val(question.question);
        $('#response_sentence').val('-');
        $('button#answer').show();
    });

    $('button#answer').click(function(event){
        event.preventDefault();
        $('#response_sentence').val(question.answer);
        $('button#answer').hide();
    })

});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


