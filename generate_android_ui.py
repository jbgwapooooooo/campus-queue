import os

base_dir = r"c:\Users\L24Y09W20\Downloads\campus-queue-main\CampusQueueAndroid"

files = {
    # Layouts
    "app/src/main/res/layout/activity_login.xml": """<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp"
    android:gravity="center">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Login"
        android:textSize="24sp"
        android:layout_marginBottom="24dp"/>

    <EditText
        android:id="@+id/etEmail"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Email"
        android:inputType="textEmailAddress"
        android:layout_marginBottom="16dp"/>

    <EditText
        android:id="@+id/etPassword"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Password"
        android:inputType="textPassword"
        android:layout_marginBottom="24dp"/>

    <Button
        android:id="@+id/btnLogin"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Login"/>

    <TextView
        android:id="@+id/tvRegister"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Don't have an account? Register"
        android:layout_marginTop="16dp"
        android:textColor="@color/purple_500"/>

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        android:layout_marginTop="16dp"/>
</LinearLayout>
""",
    "app/src/main/res/layout/activity_register.xml": """<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp"
    android:gravity="center">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Register"
        android:textSize="24sp"
        android:layout_marginBottom="24dp"/>

    <EditText
        android:id="@+id/etName"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Name"
        android:layout_marginBottom="16dp"/>

    <EditText
        android:id="@+id/etEmail"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Email"
        android:inputType="textEmailAddress"
        android:layout_marginBottom="16dp"/>

    <EditText
        android:id="@+id/etPassword"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Password"
        android:inputType="textPassword"
        android:layout_marginBottom="24dp"/>

    <Button
        android:id="@+id/btnRegister"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Register"/>

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        android:layout_marginTop="16dp"/>
</LinearLayout>
""",
    "app/src/main/res/layout/activity_dashboard.xml": """<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp"
    android:gravity="top|center_horizontal">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Dashboard"
        android:textSize="28sp"
        android:textStyle="bold"
        android:layout_marginBottom="24dp"/>

    <TextView
        android:id="@+id/tvMessage"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="18sp"
        android:text="Loading..."
        android:gravity="center"
        android:layout_marginBottom="24dp"/>

    <Button
        android:id="@+id/btnProfile"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Go to Profile"
        android:layout_marginBottom="16dp"/>

    <Button
        android:id="@+id/btnLogout"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Logout"
        android:backgroundTint="@color/teal_700"/>

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        android:layout_marginTop="16dp"/>
</LinearLayout>
""",
    "app/src/main/res/layout/activity_profile.xml": """<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp"
    android:gravity="top|center_horizontal">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Profile"
        android:textSize="28sp"
        android:textStyle="bold"
        android:layout_marginBottom="24dp"/>

    <TextView
        android:id="@+id/tvName"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="18sp"
        android:text="Name: Loading..."
        android:layout_marginBottom="16dp"/>
        
    <TextView
        android:id="@+id/tvEmail"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="18sp"
        android:text="Email: Loading..."
        android:layout_marginBottom="24dp"/>

    <Button
        android:id="@+id/btnEditProfile"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Edit Profile"
        android:layout_marginBottom="16dp"/>

    <Button
        android:id="@+id/btnChangePassword"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Change Password"/>

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        android:layout_marginTop="16dp"/>
</LinearLayout>
""",
    "app/src/main/res/layout/activity_update_profile.xml": """<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp"
    android:gravity="center">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Update Profile"
        android:textSize="24sp"
        android:layout_marginBottom="24dp"/>

    <EditText
        android:id="@+id/etName"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="New Name"
        android:layout_marginBottom="24dp"/>

    <Button
        android:id="@+id/btnUpdate"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Update"/>

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        android:layout_marginTop="16dp"/>
</LinearLayout>
""",
    "app/src/main/res/layout/activity_change_password.xml": """<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp"
    android:gravity="center">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Change Password"
        android:textSize="24sp"
        android:layout_marginBottom="24dp"/>

    <EditText
        android:id="@+id/etOldPassword"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Old Password"
        android:inputType="textPassword"
        android:layout_marginBottom="16dp"/>
        
    <EditText
        android:id="@+id/etNewPassword"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="New Password"
        android:inputType="textPassword"
        android:layout_marginBottom="24dp"/>

    <Button
        android:id="@+id/btnChangePassword"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Change Password"/>

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        android:layout_marginTop="16dp"/>
</LinearLayout>
""",
    # Kotlin Utils (Base Activity for API calls error handling)
    "app/src/main/java/com/example/campusqueue/utils/ApiErrorHandler.kt": """package com.example.campusqueue.utils

import android.content.Context
import android.widget.Toast
import org.json.JSONObject
import retrofit2.Response

object ApiErrorHandler {
    fun <T> handleError(context: Context, response: Response<T>) {
        try {
            val errorBody = response.errorBody()?.string()
            val errorMessage = if (errorBody != null) {
                JSONObject(errorBody).getString("message")
            } else {
                "Unknown error occurred"
            }
            
            val displayMessage = when(response.code()) {
                400 -> "Bad Request: $errorMessage"
                401 -> "Unauthorized: $errorMessage"
                500 -> "Server Error: $errorMessage"
                else -> errorMessage
            }
            Toast.makeText(context, displayMessage, Toast.LENGTH_LONG).show()
        } catch (e: Exception) {
            Toast.makeText(context, "Error: ${response.code()}", Toast.LENGTH_LONG).show()
        }
    }
    
    fun handleNetworkError(context: Context, t: Throwable) {
        Toast.makeText(context, "Network Error: Please check your internet connection.", Toast.LENGTH_LONG).show()
    }
}
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath.replace('/', os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("UI scaffold completed.")
