// @ts-nocheck
import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const Blur: NextPage = () => {
  const [enableWasm, setEnableWasm] = useState(false);
  const [origImg, setOrigImg] = useState(null);
  const [resImg, setResImg] = useState(null);
  const [loading, setLoading] = useState(false);

  function fileSelected(e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/png')) {
      alert('Please select a png image.');
      return;
    }

    const img = document.createElement('img');
    img.file = file;

    const reader = new FileReader();
    reader.onload = (function (aImg) {
      return function (e) {
        aImg.src = e.target.result;
        setOrigImg(aImg);
        setEnableWasm(true);
      };
    })(img);
    reader.readAsDataURL(file);
  }

  function runWasm(e) {
    const img = document.createElement('img');

    const reader = new FileReader();
    reader.onload = function (e) {
      setLoading(true);
      var oReq = new XMLHttpRequest();
      oReq.open('POST', '/api/blur-img', true);
      oReq.setRequestHeader('image-type', origImg.file.type);
      oReq.responseType = 'blob';
      oReq.onload = (function (bImg) {
        return function (oEvent) {
          setLoading(false);
          bImg.src = URL.createObjectURL(oReq.response);
          setResImg(bImg);
          URL.revokeObjectURL(oReq.response);
        };
      })(img);
      const blob = new Blob([e.target.result], {
        type: 'application/octet-stream',
      });
      oReq.send(blob);
    };
    reader.readAsArrayBuffer(origImg.file);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Images Magic Crab</h1>

        <p className={styles.description}>Select image to start your journey</p>

        <div className={styles.grid}></div>
        <div className={styles.operating}>
          <div>
            <input
              type='file'
              id='fileElem'
              accept='image/png'
              className={styles['visually-hidden']}
              onChange={fileSelected}
            />
            <label htmlFor='fileElem' className={styles.noselect}>
              Select an image
            </label>
            <div className={styles.thumb}>
              {origImg && <img src={origImg.src} alt='origImg' />}
            </div>
          </div>
          <div>
            <button
              id='runBtn'
              onClick={runWasm}
              disabled={!enableWasm || loading}
            >
              {loading ? 'Loading' : 'Run Wasm'}
            </button>
            <div className={styles.thumb}>
              {resImg && <img src={resImg.src} alt='resImg' />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blur;