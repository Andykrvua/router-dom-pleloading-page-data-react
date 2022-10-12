import { Suspense } from 'react';
import {
  Link,
  useNavigate,
  useLoaderData,
  Await,
  useAsyncValue,
  defer,
} from 'react-router-dom';

const Post = () => {
  // useAsyncValue дозволяє отримати дані з функції лоадера
  const post = useAsyncValue();
  return (
    <>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </>
  );
};

const Comments = () => {
  // useAsyncValue дозволяє отримати дані з функції лоадера
  const comments = useAsyncValue();
  return (
    <div>
      <h2>Comments</h2>
      {comments.map((comment) => (
        <>
          <h3>{comment.email}</h3>
          <h4>{comment.name}</h4>
          <p>{comment.body}</p>
        </>
      ))}
    </div>
  );
};

const Singlepage = () => {
  // хук дістає дані з функції лоадера яку ми передаємо в компонент з роутера
  const { post, id, comments } = useLoaderData();
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  const goHome = () => navigate('/', { replace: true });

  return (
    <div>
      <button onClick={goBack}>Go back</button>
      {/* Bad approach */}
      <button onClick={goHome}>Go home</button>
      <Suspense fallback={<h2>Loading...</h2>}>
        {/* в Await обов'язково вказуємо які саме дані необхідно чекати */}
        <Await resolve={post}>
          <Post />
        </Await>
      </Suspense>
      <Suspense fallback={<h2>Loading...</h2>}>
        {/* в Await обов'язково вказуємо які саме дані необхідно чекати */}
        <Await resolve={comments}>
          <Comments />
        </Await>
      </Suspense>
      <Link to={`/posts/${id}/edit`}>Edit this post</Link>
    </div>
  );
};

async function getPostById(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return res.json();
}

async function getCommentsByPost(id) {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}/comments`
  );
  return res.json();
}

// приймає об'єкт з двома параметрами
// в базовому використанні буде блокувати перехід на сторінку до моменту отримання данних
// повертає дані необхідні компоненту, які отримуємо за допомогою хуку useLoaderData
const postLoader = async ({ request, params }) => {
  console.log(request, params);
  const id = params.id;

  // defer дозволяє не блокувати перехід, а відображати компонент підвантажуючи дані, що приходять з deferу
  // потребує Suspense та Await всередині компоненту
  // якщо повертаємо post: await getPostById(id) компонент дочекається завантаження getPostById(id)
  // а всі інші данні (getCommentsByPost(id)) будуть завантаженні вже безпосередньо на сторінці компоненту
  return defer({
    post: await getPostById(id),
    id,
    comments: getCommentsByPost(id),
  });
};

export { Singlepage, postLoader };
