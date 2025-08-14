import json
import os
import sys
import webbrowser
from urllib.request import urlopen
from packaging import version
import tkinter as tk
from tkinter import messagebox

CURRENT_VERSION = "1.0.0"
VERSION_URL = "https://raw.githubusercontent.com/PRATHVI9607/speechToText/main/version.json"

def check_for_updates(silent=False):
    try:
        with urlopen(VERSION_URL) as response:
            data = json.loads(response.read())
            latest_version = data["version"]
            
            if version.parse(latest_version) > version.parse(CURRENT_VERSION):
                if not silent:
                    root = tk.Tk()
                    root.withdraw()  # Hide the main window
                    
                    message = f"A new version ({latest_version}) is available!\n\nChangelog:\n"
                    message += "\n".join(f"• {change}" for change in data["changelog"])
                    message += "\n\nWould you like to download the update?"
                    
                    if messagebox.askyesno("Update Available", message):
                        webbrowser.open(data["download_url"])
                        sys.exit(0)  # Exit after update prompt
                    
                    root.destroy()
                return True
            elif not silent:
                root = tk.Tk()
                root.withdraw()
                messagebox.showinfo("Up to Date", "You are running the latest version!")
                root.destroy()
    except Exception as e:
        if not silent:
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Error", f"Failed to check for updates: {str(e)}")
            root.destroy()
    return False
