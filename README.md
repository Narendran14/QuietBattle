# QUIET BATTLES Demo
A full-stack website prototype for the QUIET BATTLES™ company assessment.

## Project overview
A demo clothing website for QUIET BATTLES™. Visitors can explore Series 01, read its five chapters, view The Gentle Armor Tee, choose a size, and try the sample add-to-cart interaction.

## Technology used
Frontend: React with Vite and JavaScript

Backend: Python with Flask

Database: SQLite

Database connection: Flask-SQLAlchemy

## Running the project

1.In the first terminal, go into backend, activate .\.venv\Scripts\Activate.ps1, then run python -m flask --app app run --debug.

2.In a second terminal, go into frontend, then run npm run dev.

3.Open the local address Vite shows, usually http://localhost:5173.

Keep both terminals open while using the website.

## Managing website content
1.Series: use GET and POST on /api/series; use PUT on /api/series/2 to edit the sample series.

2.Chapters: use GET and POST on /api/series/2/chapters; use PUT on /api/chapters/1 to edit a chapter.

3.Products: use POST on /api/products; use GET and PUT on /api/products/1 to view or edit the sample product.

4.Send JSON bodies for POST and PUT requests. Use the saved Quiet Battles Postman collection.

## Replacing website images
1.Images are stored in frontend/quite_battle/src/assets.

2.To change one, replace the file and update its import and image reference in src/App.jsx to match the new
filename.

3.Images are managed in the project files; there’s no image upload screen in this demo.