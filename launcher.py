import os
import sys
import webbrowser
from threading import Timer
from flask import Flask
from waitress import serve

# Import your Flask app
from app import app

def open_browser():
    """Open the default web browser to the Flask application."""
    webbrowser.open('http://localhost:5000/')

def run_app():
    """Run the Flask application with a production server."""
    if getattr(sys, 'frozen', False):
        # If the application is run as a bundle
        application_path = sys._MEIPASS
    else:
        # If the application is run from a Python interpreter
        application_path = os.path.dirname(os.path.abspath(__file__))

    # Set the static folder and template folder paths
    app.static_folder = os.path.join(application_path, 'static')
    app.template_folder = os.path.join(application_path, 'templates')

    # Open browser after a short delay
    Timer(1.5, open_browser).start()
    
    # Run the app with waitress server
    serve(app, host='localhost', port=5000)

if __name__ == '__main__':
    run_app()
