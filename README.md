# Preposition trainer

## About the project

This is a project made to train english prepositions. The idea is to prepare a list of sentences to translate and its translations. It's a very simple project written in JS mixed with bootstrap and jQuery for layout stuff.

## How to use it

These sentences are grouped in categories to train different goals.

1. Select the question category.
2. When `Next` button is clicked, the next random question of selected category is asked in text mode and voice mode (using JS speech synthesis).
3. When `Answer` button is clicked, the answer of the question is showed in text mode and voice mode.
4. If `Autoplay` option is checked, the app keeps asking questions and answering them until it gets unchecked.

## Features

There are some interesting features which can be configured:

* No backend needed. Only fork/checkout project, update config and/or source code and run it in any webserver.
* Groups configuration includes the language options (Even if the project is intended to be used for spanish->english it could be configured for other languages)
* Questions configuration have a randomize option to replace random words or parts of sentence. It selects a substitution index and replaces parts of sentence based on the same index in questions and answers.

## Configuration

### config.json

* `data_folder` -> The config relative path

### groups.json

* `id` -> Index of the category (Used to make a relation between categories and questions)
* `name` -> Name
* `question_lang` -> Question language for the voice synth
* `response_lang` -> Response language for the voice synth

### questions.json

* `group_id` -> Index of the related category
* `question` -> Question
* `answer` -> Answer
* `randomize` -> Structure for prepare random replacements. Example:

```json
{
        "group_id": "PLACE",
        "question": "##SUBJECT## ha llegado a ##PLACE##",
        "answer": "##SUBJECT## has arrived in ##PLACE##",
        "randomize": {
            "PLACE": {
                "question": ["Madrid", "España"],
                "answer": ["Madrid", "Spain"]
            },
            "SUBJECT": {
                "question": ["Él", "Ella"],
                "answer": ["He", "She"]
            }
        } 
    }
```

It will replace ##SUBJECT## in question part with one random value of the list and will replace ##SUBJECT## in answer part with the value of same index in answer part.

## Contact

Josu - josufmc@gmail.com
Project Link: [https://github.com/josufmcg/preposition_trainer](https://github.com/josufmcg/preposition_trainer)
Github Pages Link: [https://josufmcg.github.io/preposition_trainer/](https://josufmcg.github.io/preposition_trainer)