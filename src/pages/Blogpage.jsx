import { Suspense } from 'react';
import {
  Link,
  useLoaderData,
  useSearchParams,
  defer,
  Await,
} from 'react-router-dom';
import { BlogFilter } from '../components/BlogFilter';

const Blogpage = () => {
  // хук дістає дані з функції лоадера яку ми передаємо в компонент з роутера
  const { posts } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const postQuery = searchParams.get('post') || '';
  const latest = searchParams.has('latest');

  const startsFrom = latest ? 80 : 1;

  return (
    <div>
      <h1>Our news</h1>

      <BlogFilter
        postQuery={postQuery}
        latest={latest}
        setSearchParams={setSearchParams}
      />

      <Link
        to="/posts/new"
        style={{ margin: '1rem 0', display: 'inline-block' }}
      >
        Add new post
      </Link>
      {/* описуємо компонент який буде завантажено згодом */}
      <Suspense fallback={<h2>Loading...</h2>}>
        {/* в Await обов'язково вказуємо які саме дані необхідно чекати */}
        {/* інший варіант використання Await в компоненті SinlePage */}
        <Await resolve={posts}>
          {(data) => {
            return data
              .filter(
                (post) =>
                  post.title.includes(postQuery) && post.id >= startsFrom
              )
              .map((post) => (
                <Link key={post.id} to={`/posts/${post.id}`}>
                  <li>{post.title}</li>
                </Link>
              ));
          }}
        </Await>
      </Suspense>
    </div>
  );
};

async function getPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  return res.json();
}

// приймає об'єкт з двома параметрами
// в базовому використанні буде блокувати перехід на сторінку до моменту отримання данних
// повертає дані необхідні компоненту, які отримуємо за допомогою хуку useLoaderData
const blogLoader = async ({ request, params }) => {
  console.log(request, params);

  // defer дозволяє не блокувати перехід, а відображати компонент підвантажуючи дані, що приходять з deferу
  // потребує Suspense та Await всередині компоненту
  // якщо повертаємо post: await getPosts() компонент дочeкається завантаження getPosts()
  // якщо повертаємо post: getPosts() компонент буде відображено після чого дані довантажаться
  return defer({
    posts: getPosts(),
  });
};

export { Blogpage, blogLoader };
