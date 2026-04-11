package com.example.campusqueue.features.auth.register
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
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
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
