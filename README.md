# GEITE01X: Living in the IT Era — Student E-Portfolio
**OBE Final Output / Midterm & Final Project**  
**Author:** Cholo Baculi (`2025-1055282`)  
**Program & Section:** BSIT-MWA INF257  
**Faculty Mentor:** Dr. Earl Marquez Albina, LPT, DIT  
**Institution:** National University – Mall of Asia (NU MOA)  
**Palette:** Indian Red (`#CD5C5C`) & Lemon Chiffon (`#FFFACD`)  
**Shortened URL:** [https://bit.ly/geite01x_baculi](https://bit.ly/geite01x_baculi)

---

## 📂 Project Directory Structure

```text
cholo-portfolio/
│
├── index.html                   # Main single-page application (SPA) with 5 main menus & dropdowns
├── open-portfolio.bat           # 1-click launcher to open the website in your browser
├── css/
│   └── style.css                # Custom Wix lookalike styles (Indian Red & Lemon Chiffon palette)
├── js/
│   ├── ai-speech.js             # Challenge #12: Web Speech API reflection reader engine
│   └── app.js                   # Navigation, hash routing, lightbox, and rubric modal
└── assets/
    ├── cholo_picture.jpg        # Author portrait photo
    ├── videos/
    │   └── online_class_etiquette.mp4 # Video lecture by Dr. Earl Albina
    ├── activities/              # All quizzes, crossword puzzles, and OTE screenshots
    │   ├── MIDTERM QUIZ 1.jpg & 1.1.jpg
    │   ├── MIDTERM QUIZ 2.jpg & 2.1.jpg
    │   ├── MIDTERM QUIZ 3.png (Word search completed in 37s)
    │   ├── MIDTERMS OTE.jpg (Status: Done)
    │   ├── FINALS QUIZ 1.png (Score 28,500, 88% accuracy)
    │   ├── FINALS QUIZ 2.jpg (NU MOA Campus group photo)
    │   ├── FINALS QUIZ 3.png (Social Media Crossword completed)
    │   └── FINALS OTE.jpg (Status: Done)
    └── lessons/                 # All official course lecture slide decks (PDF)
```

---

## 🚀 How to Run Locally

1. **Option 1 (Fastest):** Double-click `open-portfolio.bat` or double-click `index.html`. It will instantly launch in Google Chrome, Microsoft Edge, or your default browser.
2. **Option 2 (Live Server):** If you use VS Code, install the Live Server extension, right-click `index.html`, and click **"Open with Live Server"**.

---

## 📹 When You Have Your Testimonial Video

When you record your video presentation entitled:
> *“My Journey and Testimonial in Living in the IT Era under Dr. Earl Albina”* (2 to 3 minutes)

1. Save the video file as `my_journey_testimonial.mp4`.
2. Move it into `assets/videos/`.
3. In `index.html`, search for `testimonialVideo` and update the `<source>` tag to:
   ```html
   <source src="assets/videos/my_journey_testimonial.mp4" type="video/mp4">
   ```

---

## 🌐 Free 1-Click Deployment (Vercel / Netlify / GitHub Pages)

- **Vercel:** Drag and drop this folder onto [vercel.com](https://vercel.com) or run `vercel` in terminal.
- **Netlify:** Drag and drop this folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **Shorten with Bitly:** Once deployed, shorten your URL at [bitly.com](https://bitly.com) with the alias `https://bit.ly/geite01x_baculi`.
