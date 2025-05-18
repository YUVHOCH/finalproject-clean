
//pages/Editproducts
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../styles/Editproduct.module.css";
import MDEditor from "@uiw/react-md-editor";


const Editproducts = () => {
  const { sku } = useParams();
  const [product, setProduct] = useState(null);
  const [productName, setProductName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [price, setPrice] = useState("");
  const [titleDescription, setTitleDescription] = useState("");
  const [priceInstead, setPriceInstead] = useState("");
  const [active, setActive] = useState(false);
  

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8000/products/sku/${sku}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product from API");
        }
        const found = await response.json();
  
        setProduct(found);
        setProductName(found.productName);
        setTitleDescription(found.titleDescription || "");
        setShortDescription(found.shortDescription || "");
        setLongDescription(found.longDescription || "");
        setPrice(found.price);
        setPriceInstead(found.priceInstead || "");
        setActive(found.active || false);
      } catch (err) {
        console.error("❌ Error loading product:", err);
        alert("❌ Failed to load product.");
      }
    };
  
    fetchProduct();
  }, [sku]);

  const handleUpdate = async () => {
    try {
      const updatedProduct = {
        productName,
        titleDescription,
        shortDescription,
        longDescription,
        price,
        priceInstead,
        active,
      };
  
      const response = await fetch(`http://localhost:8000/products/${sku}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
  
      const data = await response.json();
      console.log("✅ Product updated:", data);
      alert("✅ Product saved successfully!");
    } catch (error) {
      console.error("❌ Error updating product:", error);
      alert("❌ Failed to save product");
    }
  };  

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Product: {sku}</h2>
  
      <div className={styles.formGroup}>
        <label>SKU:</label>
        <input type="text" value={sku} disabled className={styles.input} />
      </div>
  
      <div className={styles.formGroup}>
        <label>Product Name:</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className={styles.input}
        />
      </div>
  
      <div className={styles.formGroup}>
        <label>Title Description:</label>
        <input
          type="text"
          value={titleDescription}
          onChange={(e) => setTitleDescription(e.target.value)}
          className={styles.input}
        />
      </div>
  
      <div className={styles.formGroup}>
        <label>Price:</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={styles.input}
        />
      </div>
  
      <div className={styles.formGroup}>
        <label>Price Instead:</label>
        <input
          type="number"
          value={priceInstead}
          onChange={(e) => setPriceInstead(e.target.value)}
          className={styles.input}
        />
      </div>
  
      <div className={styles.formGroup}>
        <label>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Active
        </label>
      </div>
  
      <div className={styles.formGroup}>
        <label>Short Description:</label>
        <MDEditor
          value={shortDescription}
          onChange={setShortDescription}
          height={200}
        />
      </div>
      <div className={styles.formGroup}>
    <label>Long Description:</label>
    <MDEditor
      value={longDescription}
      onChange={setLongDescription}
      height={300}
    />
  </div>

  <button className={styles.button} onClick={handleUpdate}>
    💾 Save Changes
  </button>
</div>

); }; 

export default Editproducts;