package com.example.campusqueue.features.auth.login
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
            routeUser()
            finish()
        }

        presenter = LoginPresenter(this)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        progressBar = findViewById(R.id.progressBar)
        
        btnLogin.setOnClickListener { presenter.login(etEmail.text.toString().trim(), etPassword.text.toString()) }
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
        // Note: LoginPresenter already saved the email to SessionManager
        routeUser()
        finish()
    }

    override fun navigateToRegister() { startActivity(Intent(this, RegisterActivity::class.java)) }
    
    // Kept to satisfy LoginContract.View if needed, though we use routeUser now
    override fun navigateToDashboard() { routeUser() }

    private fun routeUser() {
        val email = SessionManager.getEmail()
        if (email == "admin@cit.edu") {
            startActivity(Intent(this, com.example.campusqueue.features.admin.dashboard.AdminDashboardActivity::class.java))
        } else {
            startActivity(Intent(this, DashboardActivity::class.java))
        }
    }
    
    override fun onDestroy() {
        presenter.onDestroy()
        super.onDestroy()
    }
}
