import { useState, useEffect } from "react";
import { decode } from "html-entities";

function shuffleArray(array) {
  let shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export default function App() {
  const [isQuizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [category, setCategory] = useState(10);

  useEffect(() => {
    fetch(`https://opentdb.com/api.php?amount=5&category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const shuffledQuestions = data.results.map((question) => {
          const decodedQuestion = decode(question.question);
          const decodeCorrectAnswer = decode(question.correct_answer);
          const decodedAnswers = shuffleArray([
            ...question.incorrect_answers.map((answer) => decode(answer)),
            decode(question.correct_answer),
          ]);
          return {
            question: decodedQuestion,
            answers: decodedAnswers,
            correctAnswer: decodeCorrectAnswer,
            selectedAnswer: null,
          };
        });
        setQuestions(shuffledQuestions);
      });
  }, [isQuizStarted]);

  const startQuiz = () => {
    setQuizStarted(true);
    setShowResults(false);
  };
  const restartQuiz = () => {
    setQuizStarted(false);
    setShowResults(false);
    setQuestions([]);
  };
  const handleAnswerClick = (questionIndex, answer) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].selectedAnswer = answer;
    setQuestions(updatedQuestions);
  };

  function handleChange(event) {
    setCategory(event.target.value);
  }

  const checkCorrectAnswers = () => {
    let correctAnswers = 0;
    questions.forEach((question) => {
      if (question.selectedAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    return correctAnswers;
  };

  const list = questions.map((question, index) => {
    return (
      <div key={index}>
        <h2>{question.question}</h2>
        <ul>
          {question.answers.map((answer, answerIndex) => {
            const isSelected = question.selectedAnswer === answer;
            const isCorrect = question.correctAnswer === answer;
            let className = "";

            if (showResults) {
              if (isSelected) {
                className = isCorrect ? "correct-answer" : "incorrect-answer";
              } else if (!isSelected && isCorrect) {
                className = "correct-answer";
              } else {
                className = "grey-answer";
              }
            }
            return (
              <li
                key={answerIndex}
                onClick={() => handleAnswerClick(index, answer)}
              >
                <input
                  type="radio"
                  name={`question${index}`}
                  checked={answer === question.selectedAnswer}
                  id={`question${index}_${answerIndex}`}
                  readOnly
                />
                <label
                  htmlFor={`question${index}_${answerIndex}`}
                  className={className}
                >
                  {answer}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    );
  });

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="300"
        height="300"
        viewBox="0 0 158 141"
        fill="none"
        className="yellow"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M63.4095 81.3947C35.1213 50.8508 -2.68211 21.7816 1.17274 -19.6933C5.43941 -65.599 39.854 -105.359 82.4191 -123.133C122.797 -139.994 170.035 -130.256 205.822 -105.149C235.947 -84.0141 236.823 -43.8756 246.141 -8.27104C256.17 30.0508 282.521 70.8106 260.501 103.779C237.538 138.159 188.991 143.432 147.931 138.768C112.318 134.723 87.7505 107.677 63.4095 81.3947Z"
          fill="#FFFAD1"
        />
      </svg>

      {!isQuizStarted && (
        <div className="start-page">
          <h1>Quizzical</h1>
          <label htmlFor="category">Select a category</label>
          <select id="category" onChange={handleChange}>
            <option value="10">Books</option>
            <option value="11">Film</option>
            <option value="12">Music</option>
            <option value="15">Video Games</option>
          </select>
          <button onClick={startQuiz}>Start quiz</button>
        </div>
      )}

      {isQuizStarted && (
        <div className="quiz-content">
          {list}
          <div className="result-wrapper">
            {showResults && (
              <p>You scored {checkCorrectAnswers()}/5 correct answers</p>
            )}
            <button
              className="check-btn"
              onClick={!showResults ? () => setShowResults(true) : restartQuiz}
            >
              {showResults ? "Play again" : "Check answers"}
            </button>
          </div>
        </div>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        viewBox="0 0 148 118"
        fill="none"
        className="blue"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M-5.55191 4.90596C35.9614 1.77498 82.2425 -9.72149 112.306 19.1094C145.581 51.0203 155.282 102.703 142.701 147.081C130.767 189.18 93.7448 220.092 51.8208 232.476C16.5281 242.902 -15.4332 218.605 -49.1007 203.738C-85.3375 187.737 -133.641 182.993 -145.741 145.239C-158.358 105.868 -132.269 64.5881 -103.064 35.3528C-77.7328 9.99541 -41.2727 7.60006 -5.55191 4.90596Z"
          fill="#DEEBF8"
        />
      </svg>
    </>
  );
}
