import { useState, useEffect } from "react";

const useFetch = (url) => {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((products) => setProducts(products));
  }, [url]);

  return [products];
};

export default useFetch;
