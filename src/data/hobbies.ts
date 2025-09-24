export type Hobby = {
  title: string;
  image: string; // path under /public
  note?: string;
};

export const hobbies: Hobby[] = [
  { title: 'Fotografi', image: '/images/hobbies/photo.jpg', note: 'Street & product' },
  { title: 'Ngopi', image: '/images/hobbies/coffee.jpg', note: 'Manual brew & espresso' },
];

