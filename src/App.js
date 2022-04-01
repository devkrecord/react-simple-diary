import './App.css';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import DiaryEditor from './DiaryEditor';
import DiaryList from './DiaryList';
// import OptimizeTest from './OptimizeTest';

const reducer = (state, action) => {
  //reducer는  2개의 파라미터를 받음. 첫번쨰 상태변화가 일어나기 직전의 state, 두번째 어떤 상태 변화를 일으켜야 하는지 정보가 담겨있는 action 객체
  // action 객체의 형태는 자유이다. type 값을 대문자와 _ 로 구성하는 관습이 있지만, 꼭 따라야 할 필요는 없다. ex) CREATE, CHANGE_INPUT
  switch (action.type) {
    case 'INIT': {
      return action.data;
    }
    case 'CREATE':
      const created_date = new Date().getTime();
      const newItem = {
        ...action.data,
        created_date,
      };
      return [newItem, ...state];
    case 'REMOVE':
      return state.filter((it) => it.id !== action.targetId);
    case 'EDIT':
    default:
      return state.map((it) =>
        it.id === action.targetId ? { ...it, content: action.newContent } : it
      );
  }
};

const App = () => {
  // const [data, setData] = useState([]);

  // useState 대신 useReducer를 사용하는 이유
  // : 복잡한 상태 업데이트 로직을 컴포넌트에서 분리시킬 수 있습니다. 상태 업데이트 로직을 컴포넌트 바깥에 작성 할 수도 있고, 심지어 다른 파일에 작성 후 불러와서 사용할 수 있다.

  // dispatch는 상태변화를 발생시키는 함수, dispatch는 함수형 업데이트가 필요없다.
  // dispatch 함수는 렌더링과 관계없이 함수가 동일하다는 것을 보장하기 때문에 -> useCallback을 사용하면서 dependency array를 걱정하지 않아도 됨.
  const [data, dispatch] = useReducer(reducer, []); // reducer: 상태 변화를 처리하는 함수로 따로 구현해줘야한다, state 초기값
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

    //setData(initData);
    dispatch({ type: 'INIT', data: initData });
  };

  useEffect(() => {
    getData();
  }, []);

  // useCallback : 메모이제이션된 콜백 함수를 반환
  // useCallback은 특정 함수를 새로 만들지 않고 재사용하고 싶을때 사용, 항상 최신 state를 참조할 수 있게 도와주는 함수형 업데이트
  const onCreate = useCallback((author, content, emotion) => {
    dispatch({
      type: 'CREATE',
      data: { author, content, emotion, id: dataId.current },
    });
    dataId.current += 1;
    // setData((data) => [newItem, ...data]); // 함수형 업데이트를 통해 최신 state 값을 인자로 받아 참고할 수 있다.
  }, []);

  const onRemove = useCallback((targetId) => {
    dispatch({
      type: 'REMOVE',
      targetId,
    });
    // setData((data) => data.filter((it) => it.id !== targetId));
  }, []);

  const onEdit = useCallback((targetId, newContent) => {
    dispatch({ type: 'EDIT', targetId, newContent });
    // setData((data) =>
    //   data.map((it) =>
    //     it.id === targetId ? { ...it, content: newContent } : it
    //   )
    // );
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
