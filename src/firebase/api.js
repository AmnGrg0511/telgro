import { db, auth } from "./fire";
// import firebase from 'firebase/app';

/**
 * @typedef {{
 *   text: string;
 *   options: string[];
 *   type: 'mcq';
 *   level: number;
 *   topic: string;
 *   subtopic: string;
 *   tags: string[];
 *   time: number;
 * }} Question
 */

/**
 * Save question and answer to firestore. If id is not provided, new problem is created.
 * @param {Question} question
 * @param {number} answer Index of correct option beginning from 0
 * @param {string} [id]
 */
export const saveQuestion = async (question, answer, id) => {
  const queDoc = db.collection("questions").doc(id);
  const ansDoc = db.collection("answers").doc(queDoc.id);

  const batch = db.batch();

  batch.set(queDoc, question);
  batch.set(ansDoc, { answer });
  batch.commit();
  return queDoc.id;
};

export const getQuestionAnswer = async (id) => {
  const [questionDoc, answerDoc] = await Promise.all([
    db.collection("questions").doc(id).get(),
    db.collection("answers").doc(id).get(),
  ]);

  const question = questionDoc.data();

  const data = {
    question: {
      ...question,
      options: question.options.map((option) => ({
        text: option,
      })),
    },
    answer: answerDoc.get("answer"),
  };

  return data;
};

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/**
 *
 * @param {{count: number; topic: string; subtopic?: string;}} options
 * @returns {Question[]}
 */
export const generateTest = async ({ count, topic, subtopic, userId }) => {
  // * Random query method (efficient when large no of questions)
  // const randomQuery = () => {
  // 	const randomId = db.collection('questions').doc().id;
  // 	let query = db.collection('questions').where('topic', '==', topic);

  // 	if (subtopic) {
  // 		query = query.where('subtopic', '==', subtopic);
  // 	}

  // 	return query
  // 		.where(firebase.firestore.FieldPath.documentId(), '<=', randomId)
  // 		.orderBy(firebase.firestore.FieldPath.documentId(), 'desc')
  // 		.limit(1);
  // };

  // if (!Array.isArray(topic))
  // 	topic = [topic]

  if (topic !== undefined) topic = topic.split("$");

  if (subtopic !== undefined) subtopic = subtopic.split("$");

  let topic_questions = [];
  let subtopic_questions = [];

  if (topic !== undefined && topic.length > 0) {
    let query = db
      .collection("questions")
      .where("topic", "in", topic)
      .where("valid", "==", true);
    topic_questions = (await query.get()).docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
  }

  if (subtopic !== undefined && subtopic.length > 0) {
    let query = db
      .collection("questions")
      .where("subtopic", "in", subtopic)
      .where("valid", "==", true);
    subtopic_questions = (await query.get()).docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
  }

  const userData = await db.collection("users").doc(userId).get();
  const solvedIds = Object.keys(userData.data().solved || {});

  // let queryForSubtopics = db.collection('questions').where('subtopic', 'in', subtopic).where('valid', '==', true);

  // if (subtopic) {
  // 	query = query.where('subtopic', 'in', subtopic);
  // }

  // questions = questions.concat((await queryForSubtopics.get()).docs.map(doc => ({
  // 	...doc.data(),
  // 	id: doc.id,
  // })))

  let questions = shuffle(topic_questions.concat(subtopic_questions));

  questions = Array.from(new Set(questions));
  questions = questions.filter((que) => !solvedIds.includes(que.id));

  if (questions.length <= count) {
    return questions;
  }

  const selected = new Set();

  while (selected.size < count) {
    const idx = Math.floor(Math.random() * questions.length);

    selected.add(questions[idx]);
  }

  return new Array(...selected.values());
};

/**
 *
 * @param {{testId: string}} options
 * @returns {Question[]}
 */
export const generateCustomTest = async ({ testId }) => {
  // * Random query method (efficient when large no of questions)
  // const randomQuery = () => {
  // 	const randomId = db.collection('questions').doc().id;
  // 	let query = db.collection('questions').where('topic', '==', topic);

  // 	if (subtopic) {
  // 		query = query.where('subtopic', '==', subtopic);
  // 	}

  // 	return query
  // 		.where(firebase.firestore.FieldPath.documentId(), '<=', randomId)
  // 		.orderBy(firebase.firestore.FieldPath.documentId(), 'desc')
  // 		.limit(1);
  // };

  // if (!Array.isArray(topic))
  // 	topic = [topic]

  let query = db.collection("questions").where(testId, "==", true);
  // let queryForSubtopics = db.collection('questions').where('subtopic', 'in', subtopic)

  // if (subtopic) {
  // 	query = query.where('subtopic', 'in', subtopic);
  // }

  let questions = (await query.get()).docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));

  // questions = questions.concat((await queryForSubtopics.get()).docs.map(doc => ({
  // 	...doc.data(),
  // 	id: doc.id,
  // })))

  questions = shuffle(questions);

  questions = Array.from(new Set(questions));

  return questions;
  // if (questions.length <= count) {
  // 	return questions;
  // }

  // const selected = new Set();

  // while (selected.size < count) {
  // 	const idx = Math.floor(Math.random() * questions.length);

  // 	selected.add(questions[idx]);
  // 	console.log(selected.size);
  // }

  // return new Array(...selected.values());
};

/**
 *
 * @param {string} docIds
 */
export const getAnswers = (docIds) => {
  return Promise.all(
    docIds.map((id) =>
      db
        .collection("answers")
        .doc(id)
        .get()
        .then((doc) => doc.data().answer)
    )
  );
};

/**
 *
 * @param {Question[]} questions
 */
const getUniqueTags = (questions) =>
  Array(
    ...questions
      .reduce((acc, que) => {
        if (que.tags) que.tags.forEach((tag) => acc.add(tag));
        return acc;
      }, new Set())
      .values()
  );

/**
 *
 * @param {Question[]} questions
 * @param {number[]} responses
 * @param {number} timeUsed
 */
export const evaluateTest = async (
  questions,
  responses,
  timeUsed,
  userId,
  topic
) => {
  const answers = await getAnswers(questions.map((que) => que.id));
  const all = questions.map((que, idx) => ({
    ...que,
    response: parseInt(responses[idx]),
    answer: answers[idx],
  }));

  const correct = all.filter((que) => que.answer === que.response);

  let update = {};

  for (const corr of correct) {
    update[`solved.${corr.id}`] = true;
  }

  db.collection("users").doc(userId).update(update);

  const incorrect = all.filter((que) => que.answer !== que.response);
  // const unattempted = all.filter(que => que.response === '');

  const maxScore = all.reduce(
    (acc, que) =>
      acc + que.level + (que.negativeMarking ? que.negativeMarking : 0),
    0
  );
  const score = Math.round(
    (correct.reduce(
      (acc, que) =>
        acc + que.level + (que.negativeMarking ? que.negativeMarking : 0),
      0
    ) /
      maxScore) *
      5
  );
  const incorrectTags = getUniqueTags(incorrect);

  const tagCorrectLevel = {};
  const tagTotalLevel = {};

  for (let que of all) {
    for (let tag of que?.tags ?? []) {
      if (!tagCorrectLevel.hasOwnProperty(tag)) {
        tagCorrectLevel[tag] = 0;
      }
      if (!tagTotalLevel.hasOwnProperty(tag)) {
        tagTotalLevel[tag] = 0;
      }
      if (que.answer === que.response) {
        tagCorrectLevel[tag] += que.level;
      }

      tagTotalLevel[tag] += que.level;
    }
  }

  const tagScores = {};

  for (let tag in tagCorrectLevel) {
    tagScores[tag] = Math.round(
      (tagCorrectLevel[tag] / tagTotalLevel[tag]) * 5
    );
  }

  const result = {
    score: { score, outOf: 5 },
    incorrectTags,
    tagScores,
    correctCount: `${correct.length}/${all.length}`,
  };
  const knowledgeProfileUpdate =
    (await (
      await db.collection("knowledgeProfiles").doc(auth.currentUser.uid).get()
    ).data()) || {};
  for (let que of all) {
    for (let tag of que?.tags ?? []) {
      if (tagScores.hasOwnProperty(tag)) {
        let previousTotalLevel = 0;
        try {
          previousTotalLevel =
            knowledgeProfileUpdate["scores"][que.topic][que.subtopic][
              tag.replace(".", "")
            ]["total"];
        } catch {}

        let previousScoreLevel = 0;
        try {
          previousScoreLevel =
            knowledgeProfileUpdate["scores"][que.topic][que.subtopic][
              tag.replace(".", "")
            ]["score"];
        } catch {}

        knowledgeProfileUpdate[
          `scores.${que.topic}.${que.subtopic}.${tag.replace(".", "")}.total`
        ] = previousTotalLevel + tagTotalLevel[tag] ?? 0;
        knowledgeProfileUpdate[
          `scores.${que.topic}.${que.subtopic}.${tag.replace(".", "")}.score`
        ] = previousScoreLevel + tagCorrectLevel[tag] ?? 0;
      }
    }
  }

  const batch = db.batch();
  if (Object.keys(knowledgeProfileUpdate).length > 0) {
    batch.update(
      db.collection("knowledgeProfiles").doc(auth.currentUser.uid),
      knowledgeProfileUpdate
    );
  }
  batch.set(db.collection("submissions").doc(), {
    result: result,
    uid: auth.currentUser.uid,
    questions: all,
    timestamp: new Date(),
    topic: topic,
  });

  batch.commit();

  // console.log(result);
  return {
    result: result,
    uid: auth.currentUser.uid,
    questions: all,
    timestamp: new Date(),
    topic: topic,
  };
};

export const getResources = (topic, subtopic, tags) => {
  topic = topic + "";
  subtopic = subtopic + "";

  topic = topic.split("$");
  // if(!Array.isArray(subtopic))
  subtopic = subtopic.split("$");

  let query = db.collection("resources").where("topic", "in", topic).limit(10);

  // if (tags.length > 0) {
  // 	query = query.where('tags', 'array-contains-any', tags);
  // }

  // query = query.concat(queryForSubtopics)
  return query;
};

//! // generate dummy data
// const stuff = () => Math.random().toString(36).substr(2, 5);
// for (let i = 0; i < 50; i++) {
// 	saveQuestion(
// 		{
// 			level: Math.floor(Math.random() * 5 + 1),
// 			options: [stuff(), stuff(), stuff(), stuff()],
// 			subtopic: 'Matrix',
// 			tags: [],
// 			text: stuff(),
// 			topic: 'Math',
// 			type: 'mcq',
// 		},
// 		Math.floor(Math.random() * 4),
// 	);
// }
