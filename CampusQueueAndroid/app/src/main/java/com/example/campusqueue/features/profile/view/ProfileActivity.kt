package com.example.campusqueue.features.profile.view

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import com.example.campusqueue.features.profile.update.UpdateProfileActivity

class ProfileActivity : AppCompatActivity(), ProfileContract.View {
    private lateinit var presenter: ProfilePresenter
    private lateinit var tvName: TextView
    private lateinit var tvEmail: TextView
    private lateinit var tvMemberSince: TextView
    private lateinit var tvTotalQueues: TextView
    private lateinit var ivAvatar: ImageView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        presenter = ProfilePresenter(this)
        
        tvName = findViewById(R.id.tvName)
        tvEmail = findViewById(R.id.tvEmail)
        tvMemberSince = findViewById(R.id.tvMemberSince)
        tvTotalQueues = findViewById(R.id.tvTotalQueues)
        ivAvatar = findViewById(R.id.ivAvatar)
        progressBar = findViewById(R.id.progressBar)
        
        findViewById<Button>(R.id.btnEditProfile).setOnClickListener { startActivity(Intent(this, UpdateProfileActivity::class.java)) }
    }
    
    override fun onResume() {
        super.onResume()
        presenter.fetchProfile()
    }
    
    override fun showLoading() { progressBar.visibility = View.VISIBLE }
    override fun hideLoading() { progressBar.visibility = View.GONE }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }
    
    override fun onProfileLoaded(name: String, email: String, memberSince: String, totalQueues: String, avatarBase64: String?) {
        tvName.text = name
        tvEmail.text = email
        tvMemberSince.text = memberSince
        tvTotalQueues.text = totalQueues
        
        if (!avatarBase64.isNullOrEmpty()) {
            try {
                val cleanBase64 = avatarBase64.substringAfter("base64,")
                val decodedString = android.util.Base64.decode(cleanBase64, android.util.Base64.DEFAULT)
                val bitmap = android.graphics.BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
                ivAvatar.setImageBitmap(bitmap)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
    override fun onDestroy() {
        presenter.onDestroy()
        super.onDestroy()
    }
}
