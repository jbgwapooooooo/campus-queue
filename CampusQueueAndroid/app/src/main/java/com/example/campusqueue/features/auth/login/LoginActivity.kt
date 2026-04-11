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
            navigateToDashboard()
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
