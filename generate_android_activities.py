import os

base_dir = r"c:\Users\L24Y09W20\Downloads\campus-queue-main\CampusQueueAndroid"

files = {
    # Activities
    "app/src/main/java/com/example/campusqueue/ui/LoginActivity.kt": """package com.example.campusqueue.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.LoginRequest
import com.example.campusqueue.network.models.LoginResponse
import com.example.campusqueue.utils.ApiErrorHandler
import com.example.campusqueue.utils.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var tvRegister: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        
        SessionManager.init(this)
        if (SessionManager.fetchToken() != null) {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
        }

        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        tvRegister = findViewById(R.id.tvRegister)
        progressBar = findViewById(R.id.progressBar)

        btnLogin.setOnClickListener { login() }
        tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun login() {
        val email = etEmail.text.toString()
        val password = etPassword.text.toString()
        if (email.isEmpty() || password.isEmpty()) return

        setLoading(true)
        val request = LoginRequest(email, password)
        RetrofitClient.instance.login(request).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                setLoading(false)
                if (response.isSuccessful) {
                    response.body()?.token?.let {
                        SessionManager.saveToken(it)
                        startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                        finish()
                    }
                } else {
                    ApiErrorHandler.handleError(this@LoginActivity, response)
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                setLoading(false)
                ApiErrorHandler.handleNetworkError(this@LoginActivity, t)
            }
        })
    }

    private fun setLoading(isLoading: Boolean) {
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        btnLogin.isEnabled = !isLoading
    }
}
""",
    "app/src/main/java/com/example/campusqueue/ui/RegisterActivity.kt": """package com.example.campusqueue.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.GenericResponse
import com.example.campusqueue.network.models.RegisterRequest
import com.example.campusqueue.utils.ApiErrorHandler
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterActivity : AppCompatActivity() {

    private lateinit var etName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnRegister: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        etName = findViewById(R.id.etName)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnRegister = findViewById(R.id.btnRegister)
        progressBar = findViewById(R.id.progressBar)

        btnRegister.setOnClickListener { register() }
    }

    private fun register() {
        val name = etName.text.toString()
        val email = etEmail.text.toString()
        val password = etPassword.text.toString()
        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) return

        setLoading(true)
        val request = RegisterRequest(email, password, name)
        RetrofitClient.instance.register(request).enqueue(object : Callback<GenericResponse> {
            override fun onResponse(call: Call<GenericResponse>, response: Response<GenericResponse>) {
                setLoading(false)
                if (response.isSuccessful) {
                    Toast.makeText(this@RegisterActivity, "Registration Successful", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    ApiErrorHandler.handleError(this@RegisterActivity, response)
                }
            }

            override fun onFailure(call: Call<GenericResponse>, t: Throwable) {
                setLoading(false)
                ApiErrorHandler.handleNetworkError(this@RegisterActivity, t)
            }
        })
    }

    private fun setLoading(isLoading: Boolean) {
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        btnRegister.isEnabled = !isLoading
    }
}
""",
    "app/src/main/java/com/example/campusqueue/ui/DashboardActivity.kt": """package com.example.campusqueue.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.DashboardResponse
import com.example.campusqueue.utils.ApiErrorHandler
import com.example.campusqueue.utils.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class DashboardActivity : AppCompatActivity() {

    private lateinit var tvMessage: TextView
    private lateinit var btnProfile: Button
    private lateinit var btnLogout: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        tvMessage = findViewById(R.id.tvMessage)
        btnProfile = findViewById(R.id.btnProfile)
        btnLogout = findViewById(R.id.btnLogout)
        progressBar = findViewById(R.id.progressBar)

        btnProfile.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }

        btnLogout.setOnClickListener {
            SessionManager.clear()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        fetchDashboard()
    }

    private fun fetchDashboard() {
        setLoading(true)
        RetrofitClient.instance.getDashboard().enqueue(object : Callback<DashboardResponse> {
            override fun onResponse(call: Call<DashboardResponse>, response: Response<DashboardResponse>) {
                setLoading(false)
                if (response.isSuccessful) {
                    val res = response.body()
                    tvMessage.text = "Dashboard: ${res?.message}\\nStats: ${res?.stats}"
                } else {
                    ApiErrorHandler.handleError(this@DashboardActivity, response)
                    if (response.code() == 401) {
                        SessionManager.clear()
                        startActivity(Intent(this@DashboardActivity, LoginActivity::class.java))
                        finish()
                    }
                }
            }

            override fun onFailure(call: Call<DashboardResponse>, t: Throwable) {
                setLoading(false)
                ApiErrorHandler.handleNetworkError(this@DashboardActivity, t)
            }
        })
    }

    private fun setLoading(isLoading: Boolean) {
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
    }
}
""",
    "app/src/main/java/com/example/campusqueue/ui/ProfileActivity.kt": """package com.example.campusqueue.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.ProfileResponse
import com.example.campusqueue.utils.ApiErrorHandler
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileActivity : AppCompatActivity() {

    private lateinit var tvName: TextView
    private lateinit var tvEmail: TextView
    private lateinit var btnEditProfile: Button
    private lateinit var btnChangePassword: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        tvName = findViewById(R.id.tvName)
        tvEmail = findViewById(R.id.tvEmail)
        btnEditProfile = findViewById(R.id.btnEditProfile)
        btnChangePassword = findViewById(R.id.btnChangePassword)
        progressBar = findViewById(R.id.progressBar)

        btnEditProfile.setOnClickListener {
            startActivity(Intent(this, UpdateProfileActivity::class.java))
        }

        btnChangePassword.setOnClickListener {
            startActivity(Intent(this, ChangePasswordActivity::class.java))
        }
    }

    override fun onResume() {
        super.onResume()
        fetchProfile()
    }

    private fun fetchProfile() {
        setLoading(true)
        RetrofitClient.instance.getProfile().enqueue(object : Callback<ProfileResponse> {
            override fun onResponse(call: Call<ProfileResponse>, response: Response<ProfileResponse>) {
                setLoading(false)
                if (response.isSuccessful) {
                    val res = response.body()
                    tvName.text = "Name: ${res?.name}"
                    tvEmail.text = "Email: ${res?.email}"
                } else {
                    ApiErrorHandler.handleError(this@ProfileActivity, response)
                }
            }

            override fun onFailure(call: Call<ProfileResponse>, t: Throwable) {
                setLoading(false)
                ApiErrorHandler.handleNetworkError(this@ProfileActivity, t)
            }
        })
    }

    private fun setLoading(isLoading: Boolean) {
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
    }
}
""",
    "app/src/main/java/com/example/campusqueue/ui/UpdateProfileActivity.kt": """package com.example.campusqueue.ui

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.GenericResponse
import com.example.campusqueue.network.models.UpdateProfileRequest
import com.example.campusqueue.utils.ApiErrorHandler
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class UpdateProfileActivity : AppCompatActivity() {

    private lateinit var etName: EditText
    private lateinit var btnUpdate: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_update_profile)

        etName = findViewById(R.id.etName)
        btnUpdate = findViewById(R.id.btnUpdate)
        progressBar = findViewById(R.id.progressBar)

        btnUpdate.setOnClickListener { updateProfile() }
    }

    private fun updateProfile() {
        val name = etName.text.toString()
        if (name.isEmpty()) return

        setLoading(true)
        val request = UpdateProfileRequest(name)
        RetrofitClient.instance.updateProfile(request).enqueue(object : Callback<GenericResponse> {
            override fun onResponse(call: Call<GenericResponse>, response: Response<GenericResponse>) {
                setLoading(false)
                if (response.isSuccessful) {
                    Toast.makeText(this@UpdateProfileActivity, "Profile Updated", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    ApiErrorHandler.handleError(this@UpdateProfileActivity, response)
                }
            }

            override fun onFailure(call: Call<GenericResponse>, t: Throwable) {
                setLoading(false)
                ApiErrorHandler.handleNetworkError(this@UpdateProfileActivity, t)
            }
        })
    }

    private fun setLoading(isLoading: Boolean) {
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        btnUpdate.isEnabled = !isLoading
    }
}
""",
    "app/src/main/java/com/example/campusqueue/ui/ChangePasswordActivity.kt": """package com.example.campusqueue.ui

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.ChangePasswordRequest
import com.example.campusqueue.network.models.GenericResponse
import com.example.campusqueue.utils.ApiErrorHandler
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ChangePasswordActivity : AppCompatActivity() {

    private lateinit var etOldPassword: EditText
    private lateinit var etNewPassword: EditText
    private lateinit var btnChangePassword: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_change_password)

        etOldPassword = findViewById(R.id.etOldPassword)
        etNewPassword = findViewById(R.id.etNewPassword)
        btnChangePassword = findViewById(R.id.btnChangePassword)
        progressBar = findViewById(R.id.progressBar)

        btnChangePassword.setOnClickListener { changePassword() }
    }

    private fun changePassword() {
        val oldPass = etOldPassword.text.toString()
        val newPass = etNewPassword.text.toString()
        if (oldPass.isEmpty() || newPass.isEmpty()) return

        setLoading(true)
        val request = ChangePasswordRequest(oldPass, newPass)
        RetrofitClient.instance.changePassword(request).enqueue(object : Callback<GenericResponse> {
            override fun onResponse(call: Call<GenericResponse>, response: Response<GenericResponse>) {
                setLoading(false)
                if (response.isSuccessful) {
                    Toast.makeText(this@ChangePasswordActivity, "Password Changed successfully", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    ApiErrorHandler.handleError(this@ChangePasswordActivity, response)
                }
            }

            override fun onFailure(call: Call<GenericResponse>, t: Throwable) {
                setLoading(false)
                ApiErrorHandler.handleNetworkError(this@ChangePasswordActivity, t)
            }
        })
    }

    private fun setLoading(isLoading: Boolean) {
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        btnChangePassword.isEnabled = !isLoading
    }
}
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath.replace('/', os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Activities scaffold completed.")
