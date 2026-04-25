package com.example.campusqueue.features.admin.dashboard

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.campusqueue.R
import com.example.campusqueue.network.models.QueueEntry

class AdminQueueAdapter(
    private var entries: List<QueueEntry>,
    private val onCallClicked: (QueueEntry) -> Unit,
    private val onResolveClicked: (QueueEntry) -> Unit
) : RecyclerView.Adapter<AdminQueueAdapter.ViewHolder>() {

    fun updateData(newEntries: List<QueueEntry>) {
        entries = newEntries
        notifyDataSetChanged()
    }

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvStudentName: TextView = view.findViewById(R.id.tvStudentName)
        val tvQueuePosition: TextView = view.findViewById(R.id.tvQueuePosition)
        val tvServiceName: TextView = view.findViewById(R.id.tvServiceName)
        val btnCall: Button = view.findViewById(R.id.btnCall)
        val btnResolve: Button = view.findViewById(R.id.btnResolve)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_admin_queue, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val entry = entries[position]
        
        // Display full name or fallback to email, or 'Unknown Student'
        val studentName = entry.users?.full_name ?: entry.users?.email ?: "Unknown Student"
        holder.tvStudentName.text = studentName
        
        holder.tvQueuePosition.text = "#${entry.position}"
        holder.tvServiceName.text = entry.services?.name ?: "Service"
        
        holder.btnCall.setOnClickListener { onCallClicked(entry) }
        holder.btnResolve.setOnClickListener { onResolveClicked(entry) }
    }

    override fun getItemCount() = entries.size
}
