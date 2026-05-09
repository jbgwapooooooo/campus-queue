import os
import shutil

base_dir = r"c:\Users\L24Y09W20\Downloads\campus-queue-main\CampusQueueAndroid\app\src\main\java\com\example\campusqueue"
manifest_path = r"c:\Users\L24Y09W20\Downloads\campus-queue-main\CampusQueueAndroid\app\src\main\AndroidManifest.xml"

# Remove old ui folder
ui_dir = os.path.join(base_dir, "ui")
if os.path.exists(ui_dir):
    shutil.rmtree(ui_dir)

files = {
    # ------------------ BASE ------------------
    "base/BaseView.kt": """package com.example.campusqueue.base

interface BaseView<T> {
    fun showLoading()
    fun hideLoading()
    fun showError(message: String)
}
""",
    "base/BasePresenter.kt": """package com.example.campusqueue.base

interface BasePresenter {
    fun onDestroy()
}
""",

    # ------------------ AUTH: LOGIN ------------------
    "features/auth/login/LoginContract.kt": """package com.example.campusqueue.features.auth.login
import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView

interface LoginContract {
    interface View : BaseView<Presenter> {
        fun onLoginSuccess(token: String)
        fun navigateToRegister()
        fun navigateToDashboard()
    }
    interface Presenter : BasePresenter {
        fun login(email: String, password: String)
    }
}
""",
    "features/auth/login/LoginPresenter.kt": """package com.example.campusqueue.features.auth.login
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.LoginRequest
import com.example.campusqueue.network.models.SupabaseAuthResponse
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginPresenter(private var view: LoginContract.View?) : LoginContract.Presenter {
    override fun login(email: String, password: String) {
        if (email.isEmpty() || password.isEmpty()) {
            view?.showError("Email and Password cannot be empty")
            return
        }
        view?.showLoading()
        val request = LoginRequest(email, password)
        RetrofitClient.instance.login(request).enqueue(object : Callback<SupabaseAuthResponse> {
            override fun onResponse(call: Call<SupabaseAuthResponse>, response: Response<SupabaseAuthResponse>) {
                view?.hideLoading()
                if (response.isSuccessful) {
                    response.body()?.access_token?.let { view?.onLoginSuccess(it) }
                } else {
                    val errorBody = response.errorBody()?.string()
                    val errorMessage = try {
                        JSONObject(errorBody ?: "").getString("message")
                    } catch (e: Exception) {
                        "Login Failed"
                    }
                    view?.showError(errorMessage)
                }
            }
            override fun onFailure(call: Call<SupabaseAuthResponse>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network Error: ${t.message}")
            }
        })
    }
    override fun onDestroy() { view = null }
}
""",
    "features/auth/login/LoginActivity.kt": """package com.example.campusqueue.features.auth.login
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import com.example.campusqueue.features.auth.register.RegisterActivity
import com.example.campusqueue.features.dashboard.DashboardActivity
import com.example.campusqueue.utils.SessionManager

class LoginActivity : AppCompatActivity(), LoginContract.View {
    private lateinit var presenter: LoginPresenter
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        SessionManager.init(this)
        
        if (SessionManager.fetchToken() != null) {
            navigateToDashboard()
            finish()
        }

        presenter = LoginPresenter(this)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        progressBar = findViewById(R.id.progressBar)
        
        btnLogin.setOnClickListener { presenter.login(etEmail.text.toString(), etPassword.text.toString()) }
        findViewById<TextView>(R.id.tvRegister).setOnClickListener { navigateToRegister() }
    }

    override fun showLoading() {
        progressBar.visibility = View.VISIBLE
        btnLogin.isEnabled = false
    }
    override fun hideLoading() {
        progressBar.visibility = View.GONE
        btnLogin.isEnabled = true
    }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }
    
    override fun onLoginSuccess(token: String) {
        SessionManager.saveToken(token)
        navigateToDashboard()
        finish()
    }
    override fun navigateToRegister() { startActivity(Intent(this, RegisterActivity::class.java)) }
    override fun navigateToDashboard() { startActivity(Intent(this, DashboardActivity::class.java)) }
    
    override fun onDestroy() {
        presenter.onDestroy()
        super.onDestroy()
    }
}
""",

    # ------------------ AUTH: REGISTER ------------------
    "features/auth/register/RegisterContract.kt": """package com.example.campusqueue.features.auth.register
import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView

interface RegisterContract {
    interface View : BaseView<Presenter> {
        fun onRegisterSuccess()
    }
    interface Presenter : BasePresenter {
        fun register(email: String, password: String, name: String)
    }
}
""",
    "features/auth/register/RegisterPresenter.kt": """package com.example.campusqueue.features.auth.register
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.RegisterRequest
import com.example.campusqueue.network.models.SupabaseAuthResponse
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterPresenter(private var view: RegisterContract.View?) : RegisterContract.Presenter {
    override fun register(email: String, password: String, name: String) {
        if (email.isEmpty() || password.isEmpty() || name.isEmpty()) {
            view?.showError("Fields cannot be empty")
            return
        }
        view?.showLoading()
        val request = RegisterRequest(email, password, mapOf("name" to name))
        RetrofitClient.instance.register(request).enqueue(object : Callback<SupabaseAuthResponse> {
            override fun onResponse(call: Call<SupabaseAuthResponse>, response: Response<SupabaseAuthResponse>) {
                view?.hideLoading()
                if (response.isSuccessful) view?.onRegisterSuccess()
                else {
                    val msg = try { JSONObject(response.errorBody()?.string() ?: "").getString("message") } catch (e: Exception) { "Registration Failed" }
                    view?.showError(msg)
                }
            }
            override fun onFailure(call: Call<SupabaseAuthResponse>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network error: ${t.message}")
            }
        })
    }
    override fun onDestroy() { view = null }
}
""",
    "features/auth/register/RegisterActivity.kt": """package com.example.campusqueue.features.auth.register
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R

class RegisterActivity : AppCompatActivity(), RegisterContract.View {
    private lateinit var presenter: RegisterPresenter
    private lateinit var etName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnRegister: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)
        presenter = RegisterPresenter(this)
        etName = findViewById(R.id.etName)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnRegister = findViewById(R.id.btnRegister)
        progressBar = findViewById(R.id.progressBar)
        btnRegister.setOnClickListener { presenter.register(etEmail.text.toString(), etPassword.text.toString(), etName.text.toString()) }
    }

    override fun showLoading() {
        progressBar.visibility = View.VISIBLE
        btnRegister.isEnabled = false
    }
    override fun hideLoading() {
        progressBar.visibility = View.GONE
        btnRegister.isEnabled = true
    }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }
    override fun onRegisterSuccess() {
        Toast.makeText(this, "Registration Successful", Toast.LENGTH_SHORT).show()
        finish()
    }
    override fun onDestroy() {
        presenter.onDestroy()
        super.onDestroy()
    }
}
""",

    # ------------------ DASHBOARD ------------------
    "features/dashboard/DashboardContract.kt": """package com.example.campusqueue.features.dashboard
import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView

interface DashboardContract {
    interface View : BaseView<Presenter> {
        fun onDashboardLoaded(message: String)
        fun onUnauthorized()
    }
    interface Presenter : BasePresenter {
        fun fetchDashboard()
    }
}
""",
    "features/dashboard/DashboardPresenter.kt": """package com.example.campusqueue.features.dashboard
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.SupabaseUserResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class DashboardPresenter(private var view: DashboardContract.View?) : DashboardContract.Presenter {
    override fun fetchDashboard() {
        view?.showLoading()
        RetrofitClient.instance.getDashboard().enqueue(object : Callback<SupabaseUserResponse> {
            override fun onResponse(call: Call<SupabaseUserResponse>, response: Response<SupabaseUserResponse>) {
                view?.hideLoading()
                if (response.isSuccessful) {
                    val msg = response.body()?.user_metadata?.get("name") ?: response.body()?.email
                    view?.onDashboardLoaded("Welcome back! $msg")
                } else {
                    if (response.code() == 401) view?.onUnauthorized()
                    else view?.showError("Failed to fetch dashboard")
                }
            }
            override fun onFailure(call: Call<SupabaseUserResponse>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network Error: ${t.message}")
            }
        })
    }
    override fun onDestroy() { view = null }
}
""",
    "features/dashboard/DashboardActivity.kt": """package com.example.campusqueue.features.dashboard
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import com.example.campusqueue.features.auth.login.LoginActivity
import com.example.campusqueue.features.profile.view.ProfileActivity
import com.example.campusqueue.utils.SessionManager

class DashboardActivity : AppCompatActivity(), DashboardContract.View {
    private lateinit var presenter: DashboardPresenter
    private lateinit var tvMessage: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)
        presenter = DashboardPresenter(this)
        tvMessage = findViewById(R.id.tvMessage)
        progressBar = findViewById(R.id.progressBar)
        
        findViewById<Button>(R.id.btnProfile).setOnClickListener { startActivity(Intent(this, ProfileActivity::class.java)) }
        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            SessionManager.clear()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
        presenter.fetchDashboard()
    }
    override fun showLoading() { progressBar.visibility = View.VISIBLE }
    override fun hideLoading() { progressBar.visibility = View.GONE }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }
    override fun onDashboardLoaded(message: String) { tvMessage.text = "Dashboard:\\n$message" }
    override fun onUnauthorized() {
        SessionManager.clear()
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }
    override fun onDestroy() {
        presenter.onDestroy()
        super.onDestroy()
    }
}
""",

    # ------------------ PROFILE: VIEW ------------------
    "features/profile/view/ProfileContract.kt": """package com.example.campusqueue.features.profile.view
import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView

interface ProfileContract {
    interface View : BaseView<Presenter> {
        fun onProfileLoaded(name: String, email: String)
    }
    interface Presenter : BasePresenter {
        fun fetchProfile()
    }
}
""",
    "features/profile/view/ProfilePresenter.kt": """package com.example.campusqueue.features.profile.view
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.SupabaseUserResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfilePresenter(private var view: ProfileContract.View?) : ProfileContract.Presenter {
    override fun fetchProfile() {
        view?.showLoading()
        RetrofitClient.instance.getProfile().enqueue(object : Callback<SupabaseUserResponse> {
            override fun onResponse(call: Call<SupabaseUserResponse>, response: Response<SupabaseUserResponse>) {
                view?.hideLoading()
                if (response.isSuccessful) {
                    val res = response.body()
                    val name = res?.user_metadata?.get("name") ?: "N/A"
                    view?.onProfileLoaded(name, res?.email ?: "N/A")
                } else view?.showError("Failed to fetch profile")
            }
            override fun onFailure(call: Call<SupabaseUserResponse>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network Error")
            }
        })
    }
    override fun onDestroy() { view = null }
}
""",
    "features/profile/view/ProfileActivity.kt": """package com.example.campusqueue.features.profile.view
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import com.example.campusqueue.features.profile.update.UpdateProfileActivity
import com.example.campusqueue.features.profile.password.ChangePasswordActivity

class ProfileActivity : AppCompatActivity(), ProfileContract.View {
    private lateinit var presenter: ProfilePresenter
    private lateinit var tvName: TextView
    private lateinit var tvEmail: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)
        presenter = ProfilePresenter(this)
        tvName = findViewById(R.id.tvName)
        tvEmail = findViewById(R.id.tvEmail)
        progressBar = findViewById(R.id.progressBar)
        
        findViewById<Button>(R.id.btnEditProfile).setOnClickListener { startActivity(Intent(this, UpdateProfileActivity::class.java)) }
        findViewById<Button>(R.id.btnChangePassword).setOnClickListener { startActivity(Intent(this, ChangePasswordActivity::class.java)) }
    }
    override fun onResume() {
        super.onResume()
        presenter.fetchProfile()
    }
    override fun showLoading() { progressBar.visibility = View.VISIBLE }
    override fun hideLoading() { progressBar.visibility = View.GONE }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }
    override fun onProfileLoaded(name: String, email: String) {
        tvName.text = "Name: $name"
        tvEmail.text = "Email: $email"
    }
    override fun onDestroy() {
        presenter.onDestroy()
        super.onDestroy()
    }
}
""",

    # ------------------ PROFILE: UPDATE ------------------
    "features/profile/update/UpdateProfileContract.kt": """package com.example.campusqueue.features.profile.update
import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView

interface UpdateProfileContract {
    interface View : BaseView<Presenter> {
        fun onProfileUpdated()
    }
    interface Presenter : BasePresenter {
        fun updateProfile(name: String)
    }
}
""",
    "features/profile/update/UpdateProfilePresenter.kt": """package com.example.campusqueue.features.profile.update
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.SupabaseUserResponse
import com.example.campusqueue.network.models.UpdateProfileRequest
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class UpdateProfilePresenter(private var view: UpdateProfileContract.View?) : UpdateProfileContract.Presenter {
    override fun updateProfile(name: String) {
        if (name.isEmpty()) return
        view?.showLoading()
        val req = UpdateProfileRequest(mapOf("name" to name))
        RetrofitClient.instance.updateProfile(req).enqueue(object : Callback<SupabaseUserResponse> {
            override fun onResponse(call: Call<SupabaseUserResponse>, response: Response<SupabaseUserResponse>) {
                view?.hideLoading()
                if (response.isSuccessful) view?.onProfileUpdated()
                else view?.showError("Failed to update")
            }
            override fun onFailure(call: Call<SupabaseUserResponse>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network Error")
            }
        })
    }
    override fun onDestroy() { view = null }
}
""",
    "features/profile/update/UpdateProfileActivity.kt": """package com.example.campusqueue.features.profile.update
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R

class UpdateProfileActivity : AppCompatActivity(), UpdateProfileContract.View {
    private lateinit var presenter: UpdateProfilePresenter
    private lateinit var etName: EditText
    private lateinit var btnUpdate: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_update_profile)
        presenter = UpdateProfilePresenter(this)
        etName = findViewById(R.id.etName)
        btnUpdate = findViewById(R.id.btnUpdate)
        progressBar = findViewById(R.id.progressBar)
        btnUpdate.setOnClickListener { presenter.updateProfile(etName.text.toString()) }
    }
    override fun showLoading() {
        progressBar.visibility = View.VISIBLE
        btnUpdate.isEnabled = false
    }
    override fun hideLoading() {
        progressBar.visibility = View.GONE
        btnUpdate.isEnabled = true
    }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }
    override fun onProfileUpdated() {
        Toast.makeText(this, "Profile Updated", Toast.LENGTH_SHORT).show()
        finish()
    }
    override fun onDestroy() {
        presenter.onDestroy()
        super.onDestroy()
    }
}
""",

    # ------------------ PROFILE: PASSWORD ------------------
    "features/profile/password/ChangePasswordContract.kt": """package com.example.campusqueue.features.profile.password
import com.example.campusqueue.base.BasePresenter
import com.example.campusqueue.base.BaseView

interface ChangePasswordContract {
    interface View : BaseView<Presenter> {
        fun onPasswordChanged()
    }
    interface Presenter : BasePresenter {
        fun changePassword(newPass: String)
    }
}
""",
    "features/profile/password/ChangePasswordPresenter.kt": """package com.example.campusqueue.features.profile.password
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.ChangePasswordRequest
import com.example.campusqueue.network.models.SupabaseUserResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ChangePasswordPresenter(private var view: ChangePasswordContract.View?) : ChangePasswordContract.Presenter {
    override fun changePassword(newPass: String) {
        if (newPass.isEmpty()) return
        view?.showLoading()
        val req = ChangePasswordRequest(newPass)
        RetrofitClient.instance.changePassword(req).enqueue(object : Callback<SupabaseUserResponse> {
            override fun onResponse(call: Call<SupabaseUserResponse>, response: Response<SupabaseUserResponse>) {
                view?.hideLoading()
                if (response.isSuccessful) view?.onPasswordChanged()
                else view?.showError("Failed to change password")
            }
            override fun onFailure(call: Call<SupabaseUserResponse>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network Error")
            }
        })
    }
    override fun onDestroy() { view = null }
}
""",
    "features/profile/password/ChangePasswordActivity.kt": """package com.example.campusqueue.features.profile.password
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R

class ChangePasswordActivity : AppCompatActivity(), ChangePasswordContract.View {
    private lateinit var presenter: ChangePasswordPresenter
    private lateinit var etNewPassword: EditText
    private lateinit var btnChangePassword: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_change_password)
        presenter = ChangePasswordPresenter(this)
        etNewPassword = findViewById(R.id.etNewPassword)
        btnChangePassword = findViewById(R.id.btnChangePassword)
        progressBar = findViewById(R.id.progressBar)
        btnChangePassword.setOnClickListener { presenter.changePassword(etNewPassword.text.toString()) }
    }
    override fun showLoading() {
        progressBar.visibility = View.VISIBLE
        btnChangePassword.isEnabled = false
    }
    override fun hideLoading() {
        progressBar.visibility = View.GONE
        btnChangePassword.isEnabled = true
    }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }
    override fun onPasswordChanged() {
        Toast.makeText(this, "Password Changed", Toast.LENGTH_SHORT).show()
        finish()
    }
    override fun onDestroy() {
        presenter.onDestroy()
        super.onDestroy()
    }
}
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath.replace('/', os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

# Update Manifest
android_manifest = f"""<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.campusqueue">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/sym_def_app_icon"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.CampusQueue"
        android:usesCleartextTraffic="true">
        
        <activity android:name=".features.auth.login.LoginActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <activity android:name=".features.auth.register.RegisterActivity" />
        <activity android:name=".features.dashboard.DashboardActivity" />
        <activity android:name=".features.profile.view.ProfileActivity" />
        <activity android:name=".features.profile.update.UpdateProfileActivity" />
        <activity android:name=".features.profile.password.ChangePasswordActivity" />
    </application>

</manifest>
"""

with open(manifest_path, "w", encoding="utf-8") as f:
    f.write(android_manifest)

print("MVP Setup Done.")
