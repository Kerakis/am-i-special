import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [birthMonth, setBirthMonth] = useState(null);
  const [birthDay, setBirthDay] = useState(null);
  const [cards, setCards] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCards = async (url) => {
    let response = await axios.get(url);
    let data = response.data.data;

    while (response.data.has_more) {
      response = await axios.get(response.data.next_page);
      data = [...data, ...response.data.data];
    }

    return data;
  };

  useEffect(() => {
    if (!data) {
      setLoading(true);
      fetchCards(
        `https://api.scryfall.com/cards/search?q=is%3Adatestamped+date%3Cstx`
      ).then((data) => {
        setData(data);
        setLoading(false);
      });
    }
  }, [data]);

  useEffect(() => {
    if (birthMonth && birthDay && data) {
      const filteredCards = data.filter((card) => {
        const releaseDate = new Date(card.released_at);
        const birthDate = new Date(
          releaseDate.getFullYear(),
          birthMonth - 1,
          birthDay
        );
        return (
          Math.abs((releaseDate - birthDate) / (1000 * 60 * 60 * 24)) <= 10
        );
      });

      filteredCards.sort(
        (a, b) => new Date(a.released_at) - new Date(b.released_at)
      );

      setCards(filteredCards);
    }
  }, [birthMonth, birthDay, data]);

  const handleInputChange = (e, setter) => {
    const value = e.target.value;
    if (
      !isNaN(value) &&
      !value.includes('e') &&
      Number.isInteger(Number(value))
    ) {
      setter(value);
    }
  };

  return (
    <div className='mx-auto items-center mt-5'>
      <div className='text-center'>
        <h1 className='text-4xl'>Birthday Date-stamped Promos</h1>
      </div>
      <div className='my-4 mx-auto items-center text-center'>
        <label>
          Birth Month:
          <input
            type='number'
            min='1'
            max='12'
            onChange={(e) => handleInputChange(e, setBirthMonth)}
            className='mx-2'
          />
        </label>
        <label>
          Birthday:
          <input
            type='number'
            min='1'
            max='31'
            onChange={(e) => handleInputChange(e, setBirthDay)}
            className='mx-2'
          />
        </label>
      </div>
      {birthMonth && birthDay ? (
        loading ? (
          <div className='text-center mt-12'>
            <p>Loading...</p>
          </div>
        ) : cards.length > 0 ? (
          <div className='grid grid-cols-auto-fill-400 gap-4 text-center'>
            {cards.map((card) => (
              <a
                href={card.scryfall_uri}
                target='_blank'
                rel='noopener noreferrer'
                key={card.id}>
                <img
                  className='w-full'
                  src={
                    card.image_uris?.border_crop ||
                    card.card_faces[0].image_uris.border_crop
                  }
                  alt={card.name}
                />
                <span className='items-center'>{card.name}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className='text-center mt-12'>
            <p>
              I&apos;m afraid there are no cards with your birthday on them.
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}

export default App;
