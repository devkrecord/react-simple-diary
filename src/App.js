import './App.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DiaryEditor from './DiaryEditor';
import DiaryList from './DiaryList';
// import OptimizeTest from './OptimizeTest';

/*
const dummyList = [
  {
    id: 1,
    author: 'dev.kim',
    content: 'hello~',
    emotion: 5,
    created_date: new Date().getTime(),
  },
  {
    id: 2,
    author: '홍길동',
    content: 'hello~',
    emotion: 5,
    created_date: new Date().getTime(),
  },
  {
    id: 3,
    author: '둘리',
    content: 'hello~',
    emotion: 5,
    created_date: new Date().getTime(),
  },
  {
    id: 4,
    author: '마이콜',
    content: 'hello~',
    emotion: 5,
    created_date: new Date().getTime(),
  },
  {
    id: 5,
    author: '또치',
    content: 'hello~',
    emotion: 5,
    created_date: new Date().getTime(),
  },
];
*/

const App = () => {
  const [data, setData] = useState([]);
  const dataId = useRef(0);

  const getData = async () => {
    const res = await fetch(
      'https://jsonplaceholder.typicode.com/comments'
    ).then((res) => res.json());

    const initData = res.slice(0, 20).map((it) => {
      return {
        author: it.email,
        content: it.body,
        emotion: Math.floor(Math.random() * 5) + 1,
        created_date: new Date().getTime(),
        id: dataId.current++,
      };
    });
    setData(initData);
  };

  useEffect(() => {
    getData();
  }, []);

  // useCallback : 메모이제이션된 콜백 함수를 반환
  // useCallback은 특정 함수를 새로 만들지 않고 재사용하고 싶을때 사용, 항상 최신 state를 참조할 수 있게 도와주는 함수형 업데이트
  const onCreate = useCallback((author, content, emotion) => {
    const created_date = new Date().getTime();
    const newItem = {
      author,
      content,
      emotion,
      created_date,
      id: dataId.current,
    };
    dataId.current += 1;
    setData((data) => [newItem, ...data]); // 함수형 업데이트를 통해 최신 state 값을 인자로 받아 참고할 수 있다.
  }, []);

  const onRemove = useCallback((targetId) => {
    setData((data) => data.filter((it) => it.id !== targetId));
  }, []);

  const onEdit = useCallback((targetId, newContent) => {
    setData((data) =>
      data.map((it) =>
        it.id === targetId ? { ...it, content: newContent } : it
      )
    );
  }, []);

  const getDiaryAnalysis = useMemo(() => {
    const goodCount = data.filter((it) => it.emotion >= 3).length;
    const badCount = data.length - goodCount;
    const goodRatio = (goodCount / data.length) * 100;

    return { goodCount, badCount, goodRatio };
  }, [data.length]); //data.length 가 변하지 않으면 연산을 수행하지마라. -> 최적화

  // 함수 최적화를 위해 useMemo를 사용하면 '값'을 리턴하기 때문에 더이상 getDiaryAnalysis를 함수로 사용할 수 없다.
  // const { goodCount, badCount, goodRatio } = getDiaryAnalysis();
  const { goodCount, badCount, goodRatio } = getDiaryAnalysis;

  return (
    <div className="App">
      {/* <OptimizeTest /> : React.memo를 이용한 성능 최적화 예시 컴포넌트*/}
      <DiaryEditor onCreate={onCreate} />
      <div>전체 일기 : {data.length}</div>
      <div>기분 좋은 일기 개수: {goodCount}</div>
      <div>기분 나쁜 일기 개수: {badCount}</div>
      <div>기분 좋은 일기 비율: {goodRatio}</div>
      <DiaryList onEdit={onEdit} onRemove={onRemove} diaryList={data} />
    </div>
  );
};
export default App;
